# 💧 Aura Liquid ERC-20 Smart Portal & Wallet

A professional, high-performance Web3 ERC-20 Token Wallet and Management Portal featuring an interactive **Liquid Blue Glassmorphism UI**, real-time fluid canvas animations, audio micro-interactions, and a rich Web3 suite (Transfers, QR Code generation, Owner Minting, Deflationary Token Burning, Local Faucet, Network Switcher, and Transaction Activity Logs).

---

## ✨ Features & Enhancements

### 🎨 1. Liquid Blue UI & Visual Aesthetics
- **Interactive Fluid Canvas**: Real-time canvas simulation with drifting blue/cyan metaballs and wave ripples that subtly react to mouse movements.
- **Glassmorphism Design**: Frosted glass cards (`backdrop-filter: blur(20px)`), electric blue luminous borders, shiny liquid gradient buttons, and responsive grid layout.
- **Synthesized Audio Micro-Interactions**: Built-in Web Audio API organic liquid water-droplet sound effects on clicks, transfers, and burns (with mute/unmute toggle).
- **Typography & Icons**: Styled with Google Fonts *Outfit* & *Plus Jakarta Sans* alongside FontAwesome 6 icons.

### ⚡ 2. Core Web3 Features
- **Smart Wallet Integration**:
  - Auto-detection for MetaMask and EIP-1193 wallets.
  - Multi-account switching and auto-updating UI.
  - 1-click address copy with feedback avatar and short address pill.
- **Dynamic Token Dashboard**:
  - Live Token Name, Symbol (`MTK`), Decimals, Total Supply, and Wallet Balance.
  - Native Gas (`ETH`) balance and holding share percentage calculator.
  - Live Contract Ownership check (`owner()` vs token holder badge).
- **Send & Transfer Portal**:
  - Recipient address format validator with clipboard "Paste" helper.
  - Quick percentage selectors (`25%`, `50%`, `75%`, `MAX`).
  - Real-time estimated gas preview and live mining toasts.
- **Receive & QR Code Generator**:
  - Live generated QR code for the connected address.
  - Shareable address container with instant copy button.
- **Owner Mint & Token Burn Hub**:
  - **Owner Minting**: Deployer can mint new tokens directly to any Ethereum address.
  - **Burn Portal**: Token holders can permanently burn MTK from their balance to reduce circulating supply.
- **Testnet / Hardhat Faucet**:
  - 1-click 100 MTK Faucet claimer for local testing and developer feedback.
- **Activity & Transaction History Feed**:
  - Persistent transaction history stored in LocalStorage (Transfers, Mints, Burns, Receives) with timestamps, amounts, and Tx hashes.
- **Network Switcher & Custom Contract Settings**:
  - Live network badge (Hardhat 1337, Sepolia, Mainnet, Polygon, etc.).
  - 1-click Switch or Auto-add Hardhat Localhost network to MetaMask.
  - Dynamic Contract Address configuration modal.

---

## 🛠 Tech Stack

- **Smart Contract**: Solidity `^0.8.20`, OpenZeppelin Contracts (`ERC20`, `Ownable`)
- **Development Environment**: Hardhat, Ethers.js v6 / v5, Chai / Mocha
- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Modern CSS3 (Glassmorphism & Custom Properties)
- **Web3 Library**: Ethers.js v5.7.2 UMD
- **Server**: Express.js

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# In the project root
npm install

# In the frontend directory
cd frontend
npm install
cd ..
```

### 2. Run Tests
```bash
npx hardhat test
```

### 3. Start Local Blockchain & Deploy Contract

**Terminal 1:** Start Hardhat local node
```bash
npx hardhat node
```

**Terminal 2:** Deploy the token smart contract
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Start the Frontend Server

**Terminal 3:** Launch web interface
```bash
cd frontend
node server.js
```
Open your browser and navigate to: **`http://localhost:3000`**

---

## 🔒 Smart Contract Details

- **Contract Name**: `MyToken.sol`
- **Standard**: ERC-20 (OpenZeppelin)
- **Initial Supply**: 1,000,000 MTK minted to deployer
- **Key Functions**:
  - `transfer(to, amount)`: Standard token transfer
  - `mint(to, amount)`: Restricted to contract `owner`
  - `burn(amount)`: Open to any token holder
  - `owner()`: Returns contract owner address

---

## 📄 License
MIT License
