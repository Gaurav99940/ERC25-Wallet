/**
 * ==========================================================================
 * AURA LIQUID - ERC-20 SMART PORTAL
 * Interactive Liquid Engine, Web3 Provider & Token Controller
 * ==========================================================================
 */

// Global State
let provider = null;
let signer = null;
let tokenContract = null;
let currentAccount = null;
let currentChainId = null;
let tokenDecimals = 18;
let tokenSymbol = "MTK";
let tokenBalanceRaw = ethers.BigNumber.from(0);
let isContractOwner = false;
let soundEnabled = true;

// Default Hardhat Deployed Token Address
const DEFAULT_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let tokenAddress = localStorage.getItem('aura_token_address') || DEFAULT_TOKEN_ADDRESS;

// Comprehensive ERC-20 ABI with Ownable, Mint, and Burn
const TOKEN_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "function mint(address to, uint256 amount) public",
    "function burn(uint256 amount) public",
    "function owner() view returns (address)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

// Known Network Mappings
const NETWORK_NAMES = {
    1: "Ethereum Mainnet",
    5: "Goerli Testnet",
    11155111: "Sepolia Testnet",
    1337: "Hardhat Localhost (1337)",
    31337: "Hardhat Node (31337)",
    137: "Polygon Mainnet",
    80001: "Polygon Mumbai",
    42161: "Arbitrum One",
    56: "BNB Smart Chain"
};

/* ==========================================================================
   1. Interactive Liquid Background Canvas Engine
   ========================================================================== */
function initLiquidCanvas() {
    const canvas = document.getElementById('liquid-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Liquid metaballs / fluid particles
    const blobs = [];
    const blobCount = 7;
    const colors = [
        { r: 2, g: 132, b: 199, a: 0.18 },   // sky blue
        { r: 37, g: 99, b: 235, a: 0.22 },   // royal blue
        { r: 6, g: 182, b: 212, a: 0.16 },   // cyan
        { r: 30, g: 58, b: 138, a: 0.25 },   // deep navy
        { r: 59, g: 130, b: 246, a: 0.20 }   // electric blue
    ];

    for (let i = 0; i < blobCount; i++) {
        blobs.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.min(width, height) * (0.2 + Math.random() * 0.25),
            vx: (Math.random() - 0.5) * 0.7,
            vy: (Math.random() - 0.5) * 0.7,
            color: colors[i % colors.length],
            phase: Math.random() * Math.PI * 2
        });
    }

    // Mouse interactive liquid ripple
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    window.addEventListener('mousemove', (e) => {
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
    });

    let time = 0;
    function animateLiquid() {
        time += 0.015;
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        ctx.clearRect(0, 0, width, height);

        // Render layered fluid gradients
        blobs.forEach((blob, idx) => {
            blob.x += blob.vx;
            blob.y += blob.vy;

            // Fluid boundary wrap
            if (blob.x < -blob.radius) blob.x = width + blob.radius;
            if (blob.x > width + blob.radius) blob.x = -blob.radius;
            if (blob.y < -blob.radius) blob.y = height + blob.radius;
            if (blob.y > height + blob.radius) blob.y = -blob.radius;

            // React gently to mouse
            const dx = mouse.x - blob.x;
            const dy = mouse.y - blob.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 400) {
                blob.x -= (dx / dist) * 0.6;
                blob.y -= (dy / dist) * 0.6;
            }

            const currentRadius = blob.radius + Math.sin(time + blob.phase) * 35;
            const grad = ctx.createRadialGradient(
                blob.x, blob.y, currentRadius * 0.1,
                blob.x, blob.y, currentRadius
            );

            const c = blob.color;
            grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`);
            grad.addColorStop(0.6, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * 0.5})`);
            grad.addColorStop(1, 'rgba(7, 13, 30, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(blob.x, blob.y, currentRadius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Ambient subtle liquid wave overlay
        ctx.fillStyle = 'rgba(7, 13, 30, 0.25)';
        ctx.fillRect(0, 0, width, height);

        requestAnimationFrame(animateLiquid);
    }
    animateLiquid();
}

/* ==========================================================================
   2. Web Audio API Liquid Sound Generator
   ========================================================================== */
let audioCtx = null;
function playLiquidSound(type = 'drop') {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        if (type === 'drop') {
            // Water droplet frequency drop
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400, now);
            osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'success') {
            // Harmonic ripple chime
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                const noteOsc = audioCtx.createOscillator();
                const noteGain = audioCtx.createGain();
                noteOsc.type = 'sine';
                noteOsc.frequency.setValueAtTime(freq, now + i * 0.08);

                noteGain.gain.setValueAtTime(0.12, now + i * 0.08);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);

                noteOsc.connect(noteGain);
                noteGain.connect(audioCtx.destination);
                noteOsc.start(now + i * 0.08);
                noteOsc.stop(now + i * 0.08 + 0.35);
            });
        } else if (type === 'burn') {
            // Low sizzle / whoosh
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    } catch (e) {
        console.warn("Audio playback not allowed or unsupported", e);
    }
}

/* ==========================================================================
   3. Glassmorphic Toast Notifications
   ========================================================================== */
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    if (type === 'error') iconClass = 'fa-solid fa-circle-exclamation';
    if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `
        <i class="${iconClass}" style="font-size: 18px;"></i>
        <div style="flex: 1; word-break: break-word;">${message}</div>
    `;

    container.appendChild(toast);
    playLiquidSound(type === 'success' ? 'success' : 'drop');

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/* ==========================================================================
   4. Web3 Connection & Contract Initialization
   ========================================================================== */
async function initWeb3() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum, "any");

        // Listen to account changes
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else {
                handleAccountConnected(accounts[0]);
            }
        });

        // Listen to chain network changes
        window.ethereum.on('chainChanged', (chainIdHex) => {
            window.location.reload();
        });

        // Check if already connected
        try {
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                await handleAccountConnected(accounts[0]);
            }
            await updateNetworkBadge();
        } catch (err) {
            console.error("Auto-connect check failed:", err);
        }
    } else {
        updateNetworkBadgeOffline("No Web3 Wallet");
    }
}

async function connectWallet() {
    playLiquidSound('drop');
    if (!window.ethereum) {
        showToast("MetaMask or compatible Web3 wallet not detected! Please install MetaMask.", "error", 5000);
        return;
    }

    try {
        const btn = document.getElementById('btnConnectWallet');
        btn.innerHTML = `<span class="spinner"></span> Connecting...`;
        btn.disabled = true;

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
            await handleAccountConnected(accounts[0]);
            showToast("Wallet connected successfully!", "success");
        }
    } catch (err) {
        console.error("Connect wallet error:", err);
        showToast(`Connection failed: ${err.message || err}`, "error");
    } finally {
        const btn = document.getElementById('btnConnectWallet');
        btn.innerHTML = `<i class="fa-solid fa-wallet"></i> <span>Connect Wallet</span>`;
        btn.disabled = false;
    }
}

function disconnectWallet() {
    currentAccount = null;
    signer = null;
    tokenContract = null;
    isContractOwner = false;

    document.getElementById('btnConnectWallet').style.display = 'flex';
    document.getElementById('walletPill').style.display = 'none';
    document.getElementById('metricTokenBalance').textContent = '0.00';
    document.getElementById('metricEthBalance').textContent = '0.0000';
    document.getElementById('metricSupplyShare').textContent = '0.00%';
    document.getElementById('metricOwnerStatus').textContent = 'Not Connected';
    document.getElementById('receiveAddressFull').textContent = 'Connect your wallet to generate QR code';
    document.getElementById('qrContainer').innerHTML = '';
    showToast("Wallet disconnected", "info");
}

async function handleAccountConnected(account) {
    currentAccount = account;
    signer = provider.getSigner();

    // Update UI elements
    document.getElementById('btnConnectWallet').style.display = 'none';
    const walletPill = document.getElementById('walletPill');
    walletPill.style.display = 'flex';

    const shortAddr = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
    document.getElementById('walletShortAddress').textContent = shortAddr;
    document.getElementById('walletAvatar').textContent = account.substring(2, 4).toUpperCase();

    // Initialize Token Contract
    await initTokenContract();

    // Update Receive QR Code
    renderQrCode(account);

    // Refresh Balances & Metrics
    await refreshAllMetrics();
}

async function initTokenContract() {
    try {
        if (!signer) return;

        // Verify contract code exists at address
        const code = await provider.getCode(tokenAddress);
        if (code === '0x' || code === '0x0') {
            showToast(`No smart contract found at ${tokenAddress}. Deploy contract to active network first!`, "warning", 6000);
            document.getElementById('metricOwnerStatus').innerHTML = `<span style="color: var(--danger); font-size: 15px;">No Contract at Address</span>`;
            return;
        }

        tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);

        // Fetch basic token constants
        try {
            const [name, symbol, decimals] = await Promise.all([
                tokenContract.name(),
                tokenContract.symbol(),
                tokenContract.decimals()
            ]);

            tokenSymbol = symbol;
            tokenDecimals = decimals;

            document.getElementById('metricTokenName').textContent = name;
            document.getElementById('metricTokenSymbol').textContent = symbol;
            document.getElementById('metricBalanceSymbol').textContent = symbol;

            // Check Ownership
            try {
                const ownerAddress = await tokenContract.owner();
                if (ownerAddress.toLowerCase() === currentAccount.toLowerCase()) {
                    isContractOwner = true;
                    document.getElementById('metricOwnerStatus').innerHTML = `<span style="color: var(--success); font-size: 16px;"><i class="fa-solid fa-crown"></i> Contract Owner</span>`;
                    document.getElementById('mintOwnerStatusBadge').textContent = "Owner Verified";
                    document.getElementById('mintOwnerStatusBadge').className = "owner-badge";
                    document.getElementById('btnExecuteMint').disabled = false;
                } else {
                    isContractOwner = false;
                    document.getElementById('metricOwnerStatus').innerHTML = `<span style="color: var(--text-muted); font-size: 15px;"><i class="fa-solid fa-user"></i> Token Holder</span>`;
                    document.getElementById('mintOwnerStatusBadge').textContent = "Owner Only (Restricted)";
                    document.getElementById('mintOwnerStatusBadge').className = "non-owner-badge";
                }
            } catch (ownerErr) {
                document.getElementById('metricOwnerStatus').textContent = "Standard ERC-20";
            }

        } catch (e) {
            console.error("Error reading token metadata:", e);
        }

        // Update short contract display
        const shortContract = `${tokenAddress.substring(0, 5)}...${tokenAddress.substring(tokenAddress.length - 4)}`;
        document.getElementById('metricContractShort').textContent = shortContract;

    } catch (err) {
        console.error("Contract initialization error:", err);
    }
}

async function updateNetworkBadge() {
    if (!provider) return;
    try {
        const net = await provider.getNetwork();
        currentChainId = net.chainId;
        const netName = NETWORK_NAMES[net.chainId] || `Chain ID ${net.chainId}`;
        
        const badge = document.getElementById('networkBadge');
        const dot = document.getElementById('networkDot');
        const txt = document.getElementById('networkName');

        txt.textContent = netName;
        dot.className = "network-dot online";
    } catch (e) {
        updateNetworkBadgeOffline("Network Error");
    }
}

function updateNetworkBadgeOffline(label) {
    const dot = document.getElementById('networkDot');
    const txt = document.getElementById('networkName');
    txt.textContent = label;
    dot.className = "network-dot warning";
}

/* ==========================================================================
   5. Token Balances & Metrics
   ========================================================================== */
async function refreshAllMetrics() {
    if (!currentAccount || !provider) return;

    try {
        // Fetch ETH Balance
        const ethBalance = await provider.getBalance(currentAccount);
        const formattedEth = parseFloat(ethers.utils.formatEther(ethBalance)).toFixed(4);
        document.getElementById('metricEthBalance').textContent = formattedEth;

        if (tokenContract) {
            // Fetch MTK Balance
            tokenBalanceRaw = await tokenContract.balanceOf(currentAccount);
            const formattedTokenBal = ethers.utils.formatUnits(tokenBalanceRaw, tokenDecimals);
            const numBal = parseFloat(formattedTokenBal);
            document.getElementById('metricTokenBalance').textContent = numBal.toLocaleString(undefined, { maximumFractionDigits: 4 });

            // Available hints in form
            document.getElementById('btnAvailableBalance').textContent = `Available: ${numBal.toLocaleString()} ${tokenSymbol}`;
            document.getElementById('btnMaxBurn').textContent = `Max: ${numBal.toLocaleString()} ${tokenSymbol}`;

            // Fetch Total Supply
            const supplyRaw = await tokenContract.totalSupply();
            const formattedSupply = ethers.utils.formatUnits(supplyRaw, tokenDecimals);
            const numSupply = parseFloat(formattedSupply);
            document.getElementById('metricTotalSupply').textContent = `${numSupply.toLocaleString()} ${tokenSymbol}`;

            // Calculate percentage share
            if (numSupply > 0) {
                const share = ((numBal / numSupply) * 100).toFixed(2);
                document.getElementById('metricSupplyShare').textContent = `${share}%`;
            }
        }
    } catch (err) {
        console.error("Error refreshing balances:", err);
    }
}

/* ==========================================================================
   6. Core Operations: Transfer, Mint, Burn, Faucet
   ========================================================================== */
async function executeTransfer() {
    playLiquidSound('drop');
    if (!tokenContract || !currentAccount) {
        showToast("Please connect your wallet first!", "warning");
        return;
    }

    const recipient = document.getElementById('sendRecipient').value.trim();
    const amountStr = document.getElementById('sendAmount').value.trim();

    if (!recipient || !ethers.utils.isAddress(recipient)) {
        showToast("Please provide a valid recipient Ethereum address!", "warning");
        return;
    }

    if (!amountStr || isNaN(amountStr) || parseFloat(amountStr) <= 0) {
        showToast("Please enter a valid transfer amount greater than 0", "warning");
        return;
    }

    const btn = document.getElementById('btnExecuteTransfer');
    try {
        const parsedAmount = ethers.utils.parseUnits(amountStr, tokenDecimals);
        if (tokenBalanceRaw.lt(parsedAmount)) {
            showToast(`Insufficient MTK balance! You have ${ethers.utils.formatUnits(tokenBalanceRaw, tokenDecimals)} MTK`, "error");
            return;
        }

        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> <span>Signing & Broadcasting...</span>`;
        showToast("Please confirm transaction in your wallet...", "info");

        const tx = await tokenContract.transfer(recipient, parsedAmount);
        showToast(`Transaction broadcasted! Mining: ${tx.hash.substring(0, 10)}...`, "info", 5000);

        btn.innerHTML = `<span class="spinner"></span> <span>Confirming on-chain...</span>`;
        const receipt = await tx.wait();

        showToast(`Transfer of ${amountStr} ${tokenSymbol} successful!`, "success", 5000);
        playLiquidSound('success');

        // Log transaction to Activity History
        addActivityRecord({
            type: 'send',
            title: `Sent ${tokenSymbol}`,
            amount: `-${amountStr} ${tokenSymbol}`,
            to: recipient,
            txHash: receipt.transactionHash,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Reset inputs & refresh
        document.getElementById('sendRecipient').value = '';
        document.getElementById('sendAmount').value = '';
        await refreshAllMetrics();

    } catch (err) {
        console.error("Transfer error:", err);
        showToast(`Transfer failed: ${err.reason || err.message || err}`, "error", 6000);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-arrow-right-arrow-left"></i> <span>Transfer Tokens</span>`;
    }
}

async function executeMint() {
    playLiquidSound('drop');
    if (!tokenContract || !currentAccount) {
        showToast("Please connect your wallet first!", "warning");
        return;
    }

    let recipient = document.getElementById('mintRecipient').value.trim();
    if (!recipient) {
        recipient = currentAccount; // default to connected user
    }

    if (!ethers.utils.isAddress(recipient)) {
        showToast("Please enter a valid recipient address for minting!", "warning");
        return;
    }

    const amountStr = document.getElementById('mintAmount').value.trim();
    if (!amountStr || isNaN(amountStr) || parseFloat(amountStr) <= 0) {
        showToast("Please enter a valid mint amount!", "warning");
        return;
    }

    const btn = document.getElementById('btnExecuteMint');
    try {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> <span>Minting...</span>`;

        const parsedAmount = ethers.utils.parseUnits(amountStr, tokenDecimals);
        const tx = await tokenContract.mint(recipient, parsedAmount);
        showToast(`Mint transaction sent: ${tx.hash.substring(0, 10)}...`, "info");

        const receipt = await tx.wait();
        showToast(`Successfully minted ${amountStr} ${tokenSymbol}!`, "success", 5000);
        playLiquidSound('success');

        addActivityRecord({
            type: 'mint',
            title: `Minted ${tokenSymbol}`,
            amount: `+${amountStr} ${tokenSymbol}`,
            to: recipient,
            txHash: receipt.transactionHash,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        document.getElementById('mintAmount').value = '';
        await refreshAllMetrics();

    } catch (err) {
        console.error("Mint error:", err);
        showToast(`Mint failed (Are you the contract owner?): ${err.reason || err.message}`, "error", 6000);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-plus-circle"></i> <span>Mint MTK</span>`;
    }
}

async function executeBurn() {
    playLiquidSound('burn');
    if (!tokenContract || !currentAccount) {
        showToast("Please connect your wallet first!", "warning");
        return;
    }

    const amountStr = document.getElementById('burnAmount').value.trim();
    if (!amountStr || isNaN(amountStr) || parseFloat(amountStr) <= 0) {
        showToast("Please enter an amount to burn!", "warning");
        return;
    }

    const btn = document.getElementById('btnExecuteBurn');
    try {
        const parsedAmount = ethers.utils.parseUnits(amountStr, tokenDecimals);
        if (tokenBalanceRaw.lt(parsedAmount)) {
            showToast(`Cannot burn more than your available balance!`, "error");
            return;
        }

        if (!confirm(`Are you sure you want to permanently burn ${amountStr} MTK? This cannot be undone.`)) {
            return;
        }

        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> <span>Vaporizing...</span>`;

        const tx = await tokenContract.burn(parsedAmount);
        showToast(`Burn transaction sent: ${tx.hash.substring(0, 10)}...`, "info");

        const receipt = await tx.wait();
        showToast(`Burned ${amountStr} ${tokenSymbol} permanently!`, "success", 5000);

        addActivityRecord({
            type: 'burn',
            title: `Burned ${tokenSymbol}`,
            amount: `-${amountStr} ${tokenSymbol}`,
            to: '0x000...000 (Dead)',
            txHash: receipt.transactionHash,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        document.getElementById('burnAmount').value = '';
        await refreshAllMetrics();

    } catch (err) {
        console.error("Burn error:", err);
        showToast(`Burn failed: ${err.reason || err.message}`, "error", 6000);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-fire"></i> <span>Vaporize / Burn MTK</span>`;
    }
}

async function claimFaucet() {
    playLiquidSound('drop');
    if (!currentAccount) {
        showToast("Connect your wallet to claim faucet tokens!", "warning");
        return;
    }

    const btn = document.getElementById('btnClaimFaucet');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Claiming Faucet...`;

    try {
        // If connected user is owner, mint directly
        if (tokenContract && isContractOwner) {
            const amount = ethers.utils.parseUnits("100", tokenDecimals);
            const tx = await tokenContract.mint(currentAccount, amount);
            showToast("Faucet mint tx sent...", "info");
            const receipt = await tx.wait();
            showToast("100 MTK Faucet claimed successfully!", "success");
            playLiquidSound('success');

            addActivityRecord({
                type: 'receive',
                title: `Claimed Faucet`,
                amount: `+100 ${tokenSymbol}`,
                to: currentAccount,
                txHash: receipt.transactionHash,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

            await refreshAllMetrics();
        } else {
            // For non-owners on local node, give clear guidance or trigger simulated transfer
            showToast("Faucet claimed: On local Hardhat node, switch to deployer account to mint, or request tokens from owner!", "info", 5000);
        }
    } catch (err) {
        console.error("Faucet error:", err);
        showToast(`Faucet claim note: ${err.reason || err.message}`, "info");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-hand-holding-dollar"></i> <span>Claim 100 MTK Faucet</span>`;
    }
}

/* ==========================================================================
   7. Receive QR Code Generator
   ========================================================================== */
function renderQrCode(address) {
    const container = document.getElementById('qrContainer');
    const label = document.getElementById('receiveAddressFull');
    if (!container || !label) return;

    label.textContent = address;
    container.innerHTML = '';

    if (typeof QRCode !== 'undefined') {
        new QRCode(container, {
            text: address,
            width: 170,
            height: 170,
            colorDark: "#070d1e",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

/* ==========================================================================
   8. Activity / Transaction History Store
   ========================================================================== */
function loadActivityHistory() {
    const historyList = document.getElementById('activityList');
    const emptyState = document.getElementById('historyEmptyState');
    if (!historyList) return;

    const stored = JSON.parse(localStorage.getItem('aura_tx_history') || '[]');
    if (stored.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    historyList.innerHTML = '';

    stored.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'history-item';

        let icon = 'fa-paper-plane';
        let colorClass = 'send';
        if (item.type === 'receive') { icon = 'fa-arrow-down'; colorClass = 'receive'; }
        if (item.type === 'mint') { icon = 'fa-wand-magic-sparkles'; colorClass = 'mint'; }
        if (item.type === 'burn') { icon = 'fa-fire'; colorClass = 'burn'; }

        row.innerHTML = `
            <div class="history-left">
                <div class="history-type-icon ${colorClass}">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div class="history-meta">
                    <h4>${item.title}</h4>
                    <span>${item.timestamp} • to ${item.to.substring(0, 6)}...</span>
                </div>
            </div>
            <div class="history-amount" style="color: ${colorClass === 'send' || colorClass === 'burn' ? '#f87171' : '#34d399'};">
                ${item.amount}
            </div>
        `;
        historyList.appendChild(row);
    });
}

function addActivityRecord(record) {
    const stored = JSON.parse(localStorage.getItem('aura_tx_history') || '[]');
    stored.unshift(record);
    if (stored.length > 20) stored.pop(); // keep last 20
    localStorage.setItem('aura_tx_history', JSON.stringify(stored));
    loadActivityHistory();
}

function clearActivityHistory() {
    playLiquidSound('drop');
    localStorage.removeItem('aura_tx_history');
    loadActivityHistory();
    showToast("Transaction history cleared", "info");
}

/* ==========================================================================
   9. Switch / Add Network Helpers
   ========================================================================== */
async function switchOrAddHardhatNetwork() {
    playLiquidSound('drop');
    if (!window.ethereum) return;
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x539' }] // 1337 in hex
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x539',
                        chainName: 'Hardhat Localhost (1337)',
                        rpcUrls: ['http://127.0.0.1:8545'],
                        nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
                    }]
                });
            } catch (addError) {
                console.error("Add network failed:", addError);
            }
        }
    }
}

/* ==========================================================================
   10. Event Listeners & UI Wire-ups
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Liquid Canvas
    initLiquidCanvas();

    // 2. Load History
    loadActivityHistory();

    // 3. Connect Wallet Button
    document.getElementById('btnConnectWallet')?.addEventListener('click', connectWallet);

    // 4. Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            playLiquidSound('drop');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

            const tabId = btn.getAttribute('data-tab');
            btn.classList.add('active');
            document.getElementById(tabId)?.classList.add('active');
        });
    });

    // 5. Sound Toggle
    const soundBtn = document.getElementById('btnToggleSound');
    const soundIcon = document.getElementById('soundIcon');
    soundBtn?.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            soundBtn.classList.add('active');
            soundIcon.className = "fa-solid fa-volume-high";
            playLiquidSound('drop');
            showToast("Sound effects enabled", "info", 2000);
        } else {
            soundBtn.classList.remove('active');
            soundIcon.className = "fa-solid fa-volume-xmark";
            showToast("Sound effects muted", "info", 2000);
        }
    });

    // 6. Action Execution Buttons
    document.getElementById('btnExecuteTransfer')?.addEventListener('click', executeTransfer);
    document.getElementById('btnExecuteMint')?.addEventListener('click', executeMint);
    document.getElementById('btnExecuteBurn')?.addEventListener('click', executeBurn);
    document.getElementById('btnClaimFaucet')?.addEventListener('click', claimFaucet);
    document.getElementById('btnClearHistory')?.addEventListener('click', clearActivityHistory);
    document.getElementById('networkBadge')?.addEventListener('click', switchOrAddHardhatNetwork);

    // 7. Quick Amount Percentage Buttons
    document.querySelectorAll('.amount-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            playLiquidSound('drop');
            if (tokenBalanceRaw.isZero()) return;
            const percent = parseInt(pill.getAttribute('data-percent'), 10);
            const balFloat = parseFloat(ethers.utils.formatUnits(tokenBalanceRaw, tokenDecimals));
            const calculated = ((balFloat * percent) / 100).toFixed(4);
            document.getElementById('sendAmount').value = calculated;
        });
    });

    document.getElementById('btnMaxSend')?.addEventListener('click', () => {
        playLiquidSound('drop');
        if (tokenBalanceRaw.isZero()) return;
        document.getElementById('sendAmount').value = ethers.utils.formatUnits(tokenBalanceRaw, tokenDecimals);
    });

    document.getElementById('btnFillMaxBurn')?.addEventListener('click', () => {
        playLiquidSound('drop');
        if (tokenBalanceRaw.isZero()) return;
        document.getElementById('burnAmount').value = ethers.utils.formatUnits(tokenBalanceRaw, tokenDecimals);
    });

    // 8. Clipboard Copy Actions
    const copyText = (text, message = "Copied to clipboard!") => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            showToast(message, "success", 2500);
            playLiquidSound('drop');
        });
    };

    document.getElementById('btnCopyNavAddress')?.addEventListener('click', () => copyText(currentAccount, "Wallet address copied!"));
    document.getElementById('btnCopyReceiveAddress')?.addEventListener('click', () => copyText(currentAccount, "Receive address copied!"));
    document.getElementById('btnCopyContractAddress')?.addEventListener('click', () => copyText(tokenAddress, "Contract address copied!"));

    // 9. Paste Recipient Helper
    document.getElementById('btnPasteRecipient')?.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                document.getElementById('sendRecipient').value = text.trim();
                showToast("Address pasted from clipboard", "info", 2000);
            }
        } catch (e) {
            showToast("Clipboard access denied. Please paste manually.", "warning");
        }
    });

    // 10. Contract Settings Modal
    const contractModal = document.getElementById('contractModal');
    const inputCustomContract = document.getElementById('inputCustomContract');

    document.getElementById('btnOpenContractSettings')?.addEventListener('click', () => {
        playLiquidSound('drop');
        if (inputCustomContract) inputCustomContract.value = tokenAddress;
        contractModal?.classList.add('active');
    });

    document.getElementById('btnCloseContractModal')?.addEventListener('click', () => {
        contractModal?.classList.remove('active');
    });

    document.getElementById('btnResetDefaultContract')?.addEventListener('click', () => {
        if (inputCustomContract) inputCustomContract.value = DEFAULT_TOKEN_ADDRESS;
    });

    document.getElementById('btnSaveContractAddress')?.addEventListener('click', async () => {
        const val = inputCustomContract.value.trim();
        if (!ethers.utils.isAddress(val)) {
            showToast("Invalid Ethereum contract address format!", "error");
            return;
        }
        tokenAddress = val;
        localStorage.setItem('aura_token_address', val);
        contractModal?.classList.remove('active');
        showToast("Contract address updated!", "success");
        if (signer) {
            await initTokenContract();
            await refreshAllMetrics();
        }
    });

    // 11. Start Web3
    initWeb3();
});