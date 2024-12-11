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

    /** mapping for each address to different number
     *  and how much they are betting on each number 
     *  number -> (address -> amount)
     * 
    */
    mapping(uint256 => mapping(address => uint256)) public bets;
    /** mapping for number to the address of betters on that number 
     *  number -> [address1, address2, ...]
    */
    mapping(uint256 => address[]) public bettors;

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

    function betOnNumber(uint256 number, uint256 amount) external payable {
        if(number < 0 || number >= 37) revert InvalidNumber();
        if(amount <= 0 && amount > 6) revert InvalidAmount();

        require(token_LINK.transferFrom(msg.sender, address(this), amount), "LINK Transfer failed");

        if(bets[number][msg.sender] == 0) {
            bettors[number].push(msg.sender);
        }

        bets[number][msg.sender] += amount;        
    }

    function getNumber() external onlyOwner returns(uint256 requestId) {
        requestId = s_vrfCoordinator.requestRandomWords(VRFV2PlusClient.RandomWordsRequest({
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
        }));

        return requestId;
    }

    function fulfillRandomWords(uint256 /*requestId*/, uint256[] calldata randomWords) internal override {
        winningNumber = randomWords[0] % 37;
    }

    function getWinner() internal view returns(address[] memory) {
        address[] memory tempWinners = new address[](bettors[winningNumber].length);
        uint256 count = 0;

        for(uint256 i = 0; i < bettors[winningNumber].length; i++) {
            address bettor = bettors[winningNumber][i];
            if(bets[winningNumber][bettor] > 0) {
                tempWinners[count] = bettor;
                count++;
            }
        }

        address[] memory winners = new address[](count);

        for(uint256 j = 0; j < count; j++) {
            winners[j] = tempWinners[j];
        }

        return winners;
    }

    function payWinners(address[] memory _winners) internal {
        for(uint256 i = 0; i < _winners.length; i++) {
            address winner = _winners[i];
            uint256 payout = bets[winningNumber][winner] * 5;
            require(token_LINK.transfer(winner, payout), "LINK Transfer failed");
        }
    }

    function resetBets() internal {
        for(uint256 i = 0; i<36; i++) {
            address[] memory currentBettors = bettors[i];
            for(uint256 j = 0; j<currentBettors.length; j++) {
                delete bets[i][currentBettors[j]];
            }
            delete bettors[i];
        }
    }

    function concludeGame() external onlyOwner {
        address[] memory winners = getWinner();
        payWinners(winners);
        resetBets();
    }
}