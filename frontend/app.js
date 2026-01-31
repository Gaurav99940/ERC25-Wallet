// Check if ethers is available
if (typeof ethers === 'undefined') {
    document.getElementById('error').textContent = 'Error: ethers.js not loaded. Please check your internet connection.';
    throw new Error('ethers.js not loaded');
}

let tokenContract;
let signer;
// Make sure this matches the address from your deployment
const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const tokenABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)"
];

const HARDHAT_NETWORK_ID = '1337';
const HARDHAT_RPC_URL = 'http://127.0.0.1:8545';

async function connectWallet() {
    try {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();
            
            // Verify contract exists at address
            const code = await provider.getCode(tokenAddress);
            if (code === '0x') {
                throw new Error("No contract found at the specified address. Please deploy the contract first.");
            }
            
            const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
            
            // Verify contract is the correct one
            try {
                const name = await tokenContract.name();
                const symbol = await tokenContract.symbol();
                console.log("Connected to token:", name, symbol);
            } catch (error) {
                throw new Error("Contract at the specified address is not a valid ERC20 token");
            }
            
            setContract(tokenContract);
            setAccount(accounts[0]);
            updateBalance(accounts[0]);
        } else {
            alert("Please install MetaMask!");
        }
    } catch (error) {
        console.error("Error connecting wallet:", error);
        alert(error.message);
    }
}

async function checkBalance() {
    if (!tokenContract) {
        document.getElementById('error').textContent = 'Please connect your wallet first!';
        return;
    }

    try {
        const address = await signer.getAddress();
        const balance = await tokenContract.balanceOf(address);
        const decimals = await tokenContract.decimals();
        const formattedBalance = ethers.utils.formatUnits(balance, decimals);
        document.getElementById('tokenBalance').textContent = `Balance: ${formattedBalance} MTK`;
        document.getElementById('error').textContent = ''; // Clear any previous errors
    } catch (error) {
        console.error("Error checking balance:", error);
        document.getElementById('error').textContent = `Error checking balance: ${error.message}`;
    }
}

async function transferTokens() {
    if (!tokenContract) {
        document.getElementById('error').textContent = 'Please connect your wallet first!';
        return;
    }

    const recipient = document.getElementById('recipientAddress').value;
    const amount = document.getElementById('transferAmount').value;

    if (!recipient || !amount) {
        document.getElementById('error').textContent = 'Please fill in all fields!';
        return;
    }

    try {
        const decimals = await tokenContract.decimals();
        const amountInWei = ethers.utils.parseUnits(amount, decimals);
        
        // Show loading state
        const transferButton = document.getElementById('transferTokens');
        transferButton.disabled = true;
        transferButton.textContent = 'Transferring...';
        
        const tx = await tokenContract.transfer(recipient, amountInWei);
        await tx.wait();
        
        alert("Transfer successful!");
        checkBalance(); // Refresh balance
        
        // Reset button
        transferButton.disabled = false;
        transferButton.textContent = 'Transfer';
        document.getElementById('error').textContent = ''; // Clear any previous errors
    } catch (error) {
        console.error("Error transferring tokens:", error);
        document.getElementById('error').textContent = `Transfer failed: ${error.message}`;
        
        // Reset button
        const transferButton = document.getElementById('transferTokens');
        transferButton.disabled = false;
        transferButton.textContent = 'Transfer';
    }
}

// Event listeners
document.getElementById('connectWallet').addEventListener('click', connectWallet);
document.getElementById('checkBalance').addEventListener('click', checkBalance);
document.getElementById('transferTokens').addEventListener('click', transferTokens); 