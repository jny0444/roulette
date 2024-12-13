import { ethers } from "ethers";
import { abi } from "../constant/Roulette.json";

declare global {
    interface Window {
        ethereum?: any;
    }
}

const contractAddress = "";

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = provider.getSigner();

            return { provider, signer, address: accounts[0] };
        } catch (err) {
            console.log(err)
        }
    }
}

export const checkIfConnected = async () => {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                return { address: `${accounts[0]}` };
            } else {
                return { message: 'Connect Wallet' };
            }
        } catch (err) {
            console.log(err)
        }
    }
}

export const getContract = async () => {
    if(window.ethereum) {
        try {
            // const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner();
            const contractProvider = new ethers.Contract(contractAddress, abi, provider)
            const contractSigner = new ethers.Contract(contractAddress, abi, signer)
    
            return { contractProvider, contractSigner }
        } catch (error) {
            console.log(error)
        }
    }
}

export const fundWithLink = async (amount: number) => {
    try {
        const contract = await getContract();
        if (!contract) throw new Error("Failed to get contract");
        const tx = await contract.contractSigner.fundContractWithLink(amount);
        
        await tx.wait();
    } catch (error) {
        console.log(error)
    }
}

export const getContractBalance = async () => {
    try {
        const contract = await getContract();
        if(!contract) throw new Error("Failed to get contract");
        const balance = await contract.contractProvider.getContractBalance();

        await balance.wait();
    } catch (error) {
        console.log(error)
    }
}

export const getContractBalanceInLink = async () => {
    try {
        const contract = await getContract();
        if(!contract) throw new Error("Failed to get contract");
        const balance = await contract.contractProvider.getContractBalanceInLink();

        await balance.wait();
    } catch (error) {
        console.log(error)
    }
}

export const bet = async (number: number, amount: number) => {
    try {
        const contract = await getContract();
        if(!contract) throw new Error("Failed to get contract");
        const bet = await contract.contractSigner.betOnNumber(number, amount);

        await bet.wait();
    } catch (error) {
        console.log(error)
    }
}

export const getNumber = async () => {
    try {
        const contract = await getContract();
        if(!contract) throw new Error("Failed to get contract");
        const number = await contract.contractProvider.getNumber();

        await number.wait();
    } catch (error) {
        console.log(error)
    }
}

export const finishGame = async () => {
    try {
        const contract = await getContract();
        if(!contract) throw new Error("Failed to get contract");
        const tx = await contract.contractSigner.concludeGame();

        await tx.wait();
    } catch (error) {
        console.log(error)
    }
}