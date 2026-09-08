# 💎 Aura Liquid Crystal ERC-20 Portal & Wallet

Next-generation Web3 ERC-20 Token Wallet and Management Portal featuring an interactive **Liquid Crystal Multi-Theme Engine**, 3D perspective card physics, magnetic ripple button effects, and a complete suite of DeFi & Web3 tools (**DEX Swap**, **Liquid Staking Vault**, **Live Market Chart**, **Batch Multi-Sender**, **Address Book**, and **Network Gas Radar**).

---

## ✨ Key Features & Innovations

### 🎨 1. Liquid Crystal Visual & Interactive Experience
- **Multi-Theme Engine (Instant 1-Click Switcher)**:
  1. **Liquid Crystal Azure** (Ice Sapphire & Cyan Prismatic Glow)
  2. **Cyber Emerald Crystal** (Deep Obsidian & Neon Mint Luster)
  3. **Amethyst Quartz** (Royal Violet & Magenta Shimmer)
  4. **Obsidian Gold** (Ultra-luxe Dark Amber & Liquid Gold)
- **3D Card Tilt & Specular Light Flare**: Metric and hero cards track mouse physics in real-time (`perspective(1000px) rotateX/Y`) with dynamic luminous specular flares.
- **Magnetic Liquid Ripple Button Physics**: Expanding water ripple wave animation at exact click coordinates on buttons, cards, and tabs.
- **Harmonic Crystal Audio Synthesizer**: Web Audio API generated crystalline resonance notes on clicks, swaps, rewards, and token burns (with mute control).

---

### ⚡ 2. Advanced Web3 & DeFi Suite

| Feature | Description |
| :--- | :--- |
| **🔄 Liquid Swap (DEX Simulator)** | Instant token swap between MTK, ETH, USDT, and USDC with automated rate calculator, liquidity fee breakdown, and slippage indicator. |
| **🥩 Staking & Yield Vault** | Stake MTK tokens to earn passive **18.5% APY** with a **live per-second ticking rewards counter**, 1-click Claim Yield and Unstake. |
| **📈 Live Market Chart & Analytics** | Interactive SVG smooth Bezier curve spline price graph (24H, 7D, 1M, 1Y) with 24h High/Low, Liquidity, and Market Cap indicators. |
| **🚀 Batch Multi-Sender** | Distribute MTK tokens to multiple recipients simultaneously using CSV/multiline paste input with syntax validator. |
| **📖 Address Book & Contacts** | Save frequently used addresses with custom tags (e.g. "Dev Treasury", "Liquidity Pool") with 1-click "Send to Contact". |
| **💸 Send / Transfer Portal** | Fast token transfer with quick percentage selectors (`25%`, `50%`, `75%`, `MAX`), clipboard paste helper, and gas estimation. |
| **📱 Receive & QR Code** | Real-time QR code generator for user's wallet address + 1-click address copy. |
| **🔥 Mint & Burn Suite** | Contract owner minting hub + deflationary token burning portal for all holders. |
| **⛽ Live Gas Radar & Faucet** | Live Gwei monitor with speed status + 1-click 100 MTK testnet faucet. |

---

## 🛠 Tech Stack

- **Smart Contract**: Solidity `^0.8.20`, OpenZeppelin Contracts (`ERC20`, `Ownable`)
- **Development Environment**: Hardhat, Ethers.js v6 / v5, Chai / Mocha
- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Modern CSS3 (Custom Properties & 3D Transforms)
- **Web3 Library**: Ethers.js v5.7.2 UMD
- **Server**: Express.js

---

## 🚀 Quick Start Guide

### 1. Run Tests
```bash
npx hardhat test
```

### 2. Start Local Blockchain & Deploy Contract

**Terminal 1:** Start Hardhat local node
```bash
npx hardhat node
```

**Terminal 2:** Deploy the token smart contract
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Start Frontend Server

**Terminal 3:** Launch web interface
```bash
cd frontend
node server.js
```
Open your browser at: **`http://localhost:3000`**

---

## 📄 License
MIT License
