// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { VRFConsumerBaseV2Plus } from '@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol';
import { VRFV2PlusClient } from '@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol';

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract Roulette is VRFConsumerBaseV2Plus {
    error InvalidNumber();
    error InvalidAmount();
    error InvalidOperation();

    IERC20 public token_LINK = IERC20(0x779877A7B0D9E8603169DdbD7836e478b4624789);  // For sepolia

    address private vrfCoordinator = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;  // For sepolia

    bytes32 private s_keyHash;  // 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae
    uint256 private s_subscriptionId;
    uint16 private s_requestConfirmations = 3;
    uint32 private s_callbackGasLimit = 500000;
    uint32 private s_numWords = 1;

    uint256 public winningNumber;

    struct Bet {
        address better;
        uint256 amount;
    }

    Bet[37] public bets;

    constructor(
        bytes32 keyHash,
        uint256 subscriptionId
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        s_keyHash = keyHash;
        s_subscriptionId = subscriptionId;
    }

    receive() external payable {}  // Fund the contract

    function fundContractWithLink(uint256 amount) external onlyOwner {
        require(token_LINK.transferFrom(msg.sender, address(this), amount), "LINK Transfer failed");
    }

    function getContractBalance() external view onlyOwner returns(uint256) {
        return address(this).balance;
    }

    function getContractBalanceInLink() external view onlyOwner returns(uint256) {
        return token_LINK.balanceOf(address(this));
    }

    function betOnNumber(uint256 number, uint256 amount) external {
        if (number < 0 || number > 36) revert InvalidNumber();
        if (amount <= 0 || amount > 6) revert InvalidAmount();

        require(token_LINK.transferFrom(msg.sender, address(this), amount), "LINK transfer failed");

        bets[number] = Bet(msg.sender, amount);
    }

    function getNumber() external onlyOwner returns(uint256 requestId) {
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: s_requestConfirmations,
                callbackGasLimit: s_callbackGasLimit,
                numWords: s_numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: false
                    })
                )
            })
        );

        return requestId;
    }

    function fulfillRandomWords(uint256 /*requestId*/, uint256[] calldata randomWords) internal override {
        winningNumber = randomWords[0] % 37;
    }

    function getWinner() internal view returns(address) {
        return bets[winningNumber].better;
    }

    function payWinner(address _winner) internal {
        uint256 payout = bets[winningNumber].amount * 5;
        require(token_LINK.transfer(_winner, payout), "LINK Transfer failed");
    }

    function resetBetArray() internal {
        for(uint256 i = 0; i < 37; i++) {
            delete bets[i];
        }
    }

    function endGame() external {
        address winningPlayer = getWinner();
        payWinner(winningPlayer);
        resetBetArray();
    }
}
