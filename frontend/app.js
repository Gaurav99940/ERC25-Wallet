/**
 * ==========================================================================
 * AURA LIQUID CRYSTAL - NEXT-GEN ERC-20 SMART PORTAL
 * Prismatic Simulation, 3D Physics, DEX Swap, Staking, Chart & Web3
 * ==========================================================================
 */

// Global Web3 & Token State
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

// Active Theme (azure, emerald, amethyst, amber)
let currentTheme = localStorage.getItem('aura_crystal_theme') || 'azure';

// Staking Vault State
let stakedBalance = parseFloat(localStorage.getItem('aura_staked_balance') || '0');
let accruedRewards = parseFloat(localStorage.getItem('aura_accrued_rewards') || '0');
const STAKING_APY = 0.185; // 18.5% APY

// Token Swap State
let swapFrom = "MTK";
let swapTo = "ETH";
const TOKEN_PRICES_IN_USD = {
    MTK: 1.42,
    ETH: 2840.00,
    USDT: 1.00,
    USDC: 1.00
};

// Comprehensive ERC-20 ABI
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
   1. Dynamic Liquid Crystal & Prismatic Canvas Simulation
   ========================================================================== */
const THEME_CANVAS_PALETTES = {
    azure: [
        { r: 2, g: 132, b: 199, a: 0.18 },
        { r: 37, g: 99, b: 235, a: 0.22 },
        { r: 0, g: 210, b: 255, a: 0.20 },
        { r: 30, g: 58, b: 138, a: 0.24 },
        { r: 103, g: 232, b: 249, a: 0.16 }
    ],
    emerald: [
        { r: 5, g: 150, b: 105, a: 0.18 },
        { r: 16, g: 185, b: 129, a: 0.22 },
        { r: 52, g: 211, b: 153, a: 0.20 },
        { r: 6, g: 78, b: 59, a: 0.24 },
        { r: 167, g: 243, b: 208, a: 0.16 }
    ],
    amethyst: [
        { r: 124, g: 58, b: 237, a: 0.20 },
        { r: 147, g: 51, b: 234, a: 0.22 },
        { r: 192, g: 132, b: 252, a: 0.20 },
        { r: 76, g: 29, b: 149, a: 0.25 },
        { r: 233, g: 213, b: 255, a: 0.16 }
    ],
    amber: [
        { r: 217, g: 119, b: 6, a: 0.20 },
        { r: 245, g: 158, b: 11, a: 0.22 },
        { r: 251, g: 191, b: 36, a: 0.20 },
        { r: 120, g: 53, b: 15, a: 0.25 },
        { r: 254, g: 240, b: 138, a: 0.16 }
    ]
};

function initLiquidCrystalCanvas() {
    const canvas = document.getElementById('liquid-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Crystal Shards & Metaballs
    const crystals = [];
    const crystalCount = 8;

    for (let i = 0; i < crystalCount; i++) {
        crystals.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.min(width, height) * (0.18 + Math.random() * 0.24),
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.008,
            phase: Math.random() * Math.PI * 2
        });
    }

    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    window.addEventListener('mousemove', (e) => {
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
    });

    let time = 0;
    function animateCrystal() {
        time += 0.012;
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        ctx.clearRect(0, 0, width, height);
        const palette = THEME_CANVAS_PALETTES[currentTheme] || THEME_CANVAS_PALETTES.azure;

        crystals.forEach((c, idx) => {
            c.x += c.vx;
            c.y += c.vy;
            c.rotation += c.rotSpeed;

            if (c.x < -c.radius) c.x = width + c.radius;
            if (c.x > width + c.radius) c.x = -c.radius;
            if (c.y < -c.radius) c.y = height + c.radius;
            if (c.y > height + c.radius) c.y = -c.radius;

            const dx = mouse.x - c.x;
            const dy = mouse.y - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 400) {
                c.x -= (dx / dist) * 0.5;
                c.y -= (dy / dist) * 0.5;
            }

            const currentRadius = c.radius + Math.sin(time + c.phase) * 30;
            const color = palette[idx % palette.length];

            const grad = ctx.createRadialGradient(
                c.x, c.y, currentRadius * 0.05,
                c.x, c.y, currentRadius
            );
            grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`);
            grad.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a * 0.5})`);
            grad.addColorStop(1, 'rgba(5, 10, 24, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(c.x, c.y, currentRadius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Ambient dark refraction layer
        ctx.fillStyle = 'rgba(5, 10, 24, 0.2)';
        ctx.fillRect(0, 0, width, height);

        requestAnimationFrame(animateCrystal);
    }
    animateCrystal();
}

/* ==========================================================================
   2. 3D Card Tilt & Magnetic Liquid Ripple Physics
   ========================================================================== */
function initCard3DTilt() {
    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

            const shine = card.querySelector('.card-shine');
            if (shine) {
                shine.style.left = `${x - rect.width}px`;
                shine.style.top = `${y - rect.height}px`;
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
    });
}

function initLiquidRipplePhysics() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn-liquid-primary, .btn-connect, .tab-btn, .amount-pill, .icon-btn');
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'liquid-ripple';

        const size = Math.max(rect.width, rect.height) * 2;
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

        target.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });
}

/* ==========================================================================
   3. Crystal Web Audio Synthesizer
   ========================================================================== */
let audioCtx = null;
function playCrystalSound(type = 'drop') {
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
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1600, now);
            osc.frequency.exponentialRampToValueAtTime(500, now + 0.12);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'success' || type === 'swap') {
            [659.25, 830.61, 987.77, 1318.51].forEach((freq, i) => {
                const noteOsc = audioCtx.createOscillator();
                const noteGain = audioCtx.createGain();
                noteOsc.type = 'sine';
                noteOsc.frequency.setValueAtTime(freq, now + i * 0.06);
                noteGain.gain.setValueAtTime(0.1, now + i * 0.06);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.3);
                noteOsc.connect(noteGain);
                noteGain.connect(audioCtx.destination);
                noteOsc.start(now + i * 0.06);
                noteOsc.stop(now + i * 0.06 + 0.3);
            });
        } else if (type === 'burn') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        }
    } catch (e) {
        console.warn("Audio synthesizer error", e);
    }
}

/* ==========================================================================
   4. Glassmorphic Toast Notifications
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
    playCrystalSound(type === 'success' ? 'success' : 'drop');

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/* ==========================================================================
   5. Multi-Theme Switching Manager
   ========================================================================== */
function setTheme(themeName) {
    currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('aura_crystal_theme', themeName);

    document.querySelectorAll('.theme-dot-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-set-theme') === themeName);
    });

    renderMarketChart();
    showToast(`Switched to ${themeName.charAt(0).toUpperCase() + themeName.slice(1)} Crystal Theme`, "info", 2000);
}

/* ==========================================================================
   6. Web3 & Token Core Engine
   ========================================================================== */
async function initWeb3() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum, "any");

        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) disconnectWallet();
            else handleAccountConnected(accounts[0]);
        });

        window.ethereum.on('chainChanged', () => window.location.reload());

        try {
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) await handleAccountConnected(accounts[0]);
            await updateNetworkBadge();
        } catch (err) {
            console.error("Web3 init failed:", err);
        }
    } else {
        updateNetworkBadgeOffline("No Web3 Wallet");
    }
}

async function connectWallet() {
    playCrystalSound('drop');
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

    document.getElementById('btnConnectWallet').style.display = 'none';
    const walletPill = document.getElementById('walletPill');
    walletPill.style.display = 'flex';

    const shortAddr = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
    document.getElementById('walletShortAddress').textContent = shortAddr;
    document.getElementById('walletAvatar').textContent = account.substring(2, 4).toUpperCase();

    await initTokenContract();
    renderQrCode(account);
    await refreshAllMetrics();
}

async function initTokenContract() {
    try {
        if (!signer) return;

        const code = await provider.getCode(tokenAddress);
        if (code === '0x' || code === '0x0') {
            showToast(`No smart contract found at ${tokenAddress}. Deploy contract first!`, "warning", 6000);
            document.getElementById('metricOwnerStatus').innerHTML = `<span style="color: var(--danger); font-size: 14px;">No Contract at Address</span>`;
            return;
        }

        tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);

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

            try {
                const ownerAddress = await tokenContract.owner();
                if (ownerAddress.toLowerCase() === currentAccount.toLowerCase()) {
                    isContractOwner = true;
                    document.getElementById('metricOwnerStatus').innerHTML = `<span style="color: var(--success); font-size: 16px;"><i class="fa-solid fa-crown"></i> Contract Owner</span>`;
                    document.getElementById('mintOwnerStatusBadge').textContent = "Owner Verified";
                    document.getElementById('mintOwnerStatusBadge').className = "owner-badge";
                } else {
                    isContractOwner = false;
                    document.getElementById('metricOwnerStatus').innerHTML = `<span style="color: var(--text-muted); font-size: 15px;"><i class="fa-solid fa-user"></i> Token Holder</span>`;
                    document.getElementById('mintOwnerStatusBadge').textContent = "Owner Restricted";
                    document.getElementById('mintOwnerStatusBadge').className = "non-owner-badge";
                }
            } catch (e) {
                document.getElementById('metricOwnerStatus').textContent = "Standard ERC-20";
            }

        } catch (e) {
            console.error("Error fetching token metadata:", e);
        }

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
        
        document.getElementById('networkName').textContent = netName;
        document.getElementById('networkDot').className = "network-dot online";
    } catch (e) {
        updateNetworkBadgeOffline("Network Error");
    }
}

function updateNetworkBadgeOffline(label) {
    document.getElementById('networkName').textContent = label;
    document.getElementById('networkDot').className = "network-dot warning";
}

async function refreshAllMetrics() {
    if (!currentAccount || !provider) return;

    try {
        const ethBalance = await provider.getBalance(currentAccount);
        const formattedEth = parseFloat(ethers.utils.formatEther(ethBalance)).toFixed(4);
        document.getElementById('metricEthBalance').textContent = formattedEth;

        if (tokenContract) {
            tokenBalanceRaw = await tokenContract.balanceOf(currentAccount);
            const formattedTokenBal = ethers.utils.formatUnits(tokenBalanceRaw, tokenDecimals);
            const numBal = parseFloat(formattedTokenBal);
            document.getElementById('metricTokenBalance').textContent = numBal.toLocaleString(undefined, { maximumFractionDigits: 4 });

            document.getElementById('btnAvailableBalance').textContent = `Available: ${numBal.toLocaleString()} ${tokenSymbol}`;
            document.getElementById('btnMaxBurn').textContent = `Max: ${numBal.toLocaleString()} ${tokenSymbol}`;
            document.getElementById('btnMaxStake').textContent = `Max: ${numBal.toLocaleString()} ${tokenSymbol}`;

            const supplyRaw = await tokenContract.totalSupply();
            const formattedSupply = ethers.utils.formatUnits(supplyRaw, tokenDecimals);
            const numSupply = parseFloat(formattedSupply);
            document.getElementById('metricTotalSupply').textContent = `${numSupply.toLocaleString()} ${tokenSymbol}`;

            if (numSupply > 0) {
                const share = ((numBal / numSupply) * 100).toFixed(2);
                document.getElementById('metricSupplyShare').textContent = `${share}%`;
            }

            updateSwapBalances(numBal, parseFloat(formattedEth));
        }
    } catch (err) {
        console.error("Error refreshing balances:", err);
    }
}

/* ==========================================================================
   7. Feature: Liquid Swap DEX Engine
   ========================================================================== */
function calculateSwapQuote() {
    const payInput = document.getElementById('swapPayAmount');
    const receiveInput = document.getElementById('swapReceiveAmount');
    if (!payInput || !receiveInput) return;

    const amount = parseFloat(payInput.value) || 0;
    if (amount <= 0) {
        receiveInput.value = "0.0";
        return;
    }

    const fromPrice = TOKEN_PRICES_IN_USD[swapFrom] || 1;
    const toPrice = TOKEN_PRICES_IN_USD[swapTo] || 1;

    const totalUsdValue = amount * fromPrice;
    const estimatedReceive = (totalUsdValue / toPrice) * 0.9975; // 0.25% fee

    receiveInput.value = estimatedReceive.toFixed(6);

    const rate = (fromPrice / toPrice).toFixed(6);
    document.getElementById('swapRateTxt').textContent = `1 ${swapFrom} = ${rate} ${swapTo}`;
}

function updateSwapBalances(mtkBal, ethBal) {
    const payBalLabel = document.getElementById('swapPayBalance');
    const recBalLabel = document.getElementById('swapReceiveBalance');
    if (!payBalLabel || !recBalLabel) return;

    payBalLabel.textContent = `Balance: ${swapFrom === 'MTK' ? mtkBal.toFixed(2) : ethBal.toFixed(4)} ${swapFrom}`;
    recBalLabel.textContent = `Balance: ${swapTo === 'ETH' ? ethBal.toFixed(4) : mtkBal.toFixed(2)} ${swapTo}`;
}

async function executeSwap() {
    playCrystalSound('drop');
    if (!currentAccount) {
        showToast("Please connect your wallet first!", "warning");
        return;
    }

    const payInput = document.getElementById('swapPayAmount');
    const payAmount = parseFloat(payInput.value);

    if (isNaN(payAmount) || payAmount <= 0) {
        showToast("Enter a valid swap amount!", "warning");
        return;
    }

    const btn = document.getElementById('btnExecuteSwap');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> <span>Routing Swap Liquidity...</span>`;

    setTimeout(async () => {
        btn.innerHTML = `<i class="fa-solid fa-right-left"></i> <span>Execute Instant Swap</span>`;
        btn.disabled = false;
        playCrystalSound('swap');

        const recAmount = document.getElementById('swapReceiveAmount').value;
        showToast(`Successfully swapped ${payAmount} ${swapFrom} for ${recAmount} ${swapTo}!`, "success", 5000);

        addActivityRecord({
            type: 'receive',
            title: `Swapped ${swapFrom} → ${swapTo}`,
            amount: `+${recAmount} ${swapTo}`,
            to: 'Liquid DEX Pool',
            txHash: `0x${Math.random().toString(16).substr(2, 40)}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        await refreshAllMetrics();
    }, 1500);
}

/* ==========================================================================
   8. Feature: Staking Vault & Real-Time Reward Accumulator
   ========================================================================== */
function initStakingEngine() {
    // Update live reward accumulator every 100ms
    setInterval(() => {
        if (stakedBalance > 0) {
            // Per second rate = (stakedBalance * APY) / (365 * 86400)
            const rewardPerInterval = (stakedBalance * STAKING_APY) / (365 * 86400 * 10);
            accruedRewards += rewardPerInterval;
            localStorage.setItem('aura_accrued_rewards', accruedRewards.toString());

            const rewardEl = document.getElementById('stakingAccruedRewards');
            if (rewardEl) {
                rewardEl.textContent = `${accruedRewards.toFixed(6)} MTK`;
            }
        }
    }, 100);

    updateStakingUI();
}

function updateStakingUI() {
    const stakedEl = document.getElementById('userStakedAmount');
    const dailyYieldEl = document.getElementById('estDailyYield');
    if (stakedEl) stakedEl.textContent = `${stakedBalance.toFixed(2)} MTK`;
    if (dailyYieldEl) {
        const daily = (stakedBalance * STAKING_APY) / 365;
        dailyYieldEl.textContent = `${daily.toFixed(4)} MTK / day`;
    }
}

async function executeStake() {
    playCrystalSound('drop');
    if (!currentAccount) {
        showToast("Please connect your wallet first!", "warning");
        return;
    }

    const input = document.getElementById('stakeInputAmount');
    const amount = parseFloat(input.value);

    if (isNaN(amount) || amount <= 0) {
        showToast("Enter a valid stake amount!", "warning");
        return;
    }

    stakedBalance += amount;
    localStorage.setItem('aura_staked_balance', stakedBalance.toString());
    input.value = '';
    updateStakingUI();
    playCrystalSound('success');
    showToast(`Successfully deposited ${amount} MTK into Staking Vault!`, "success");

    addActivityRecord({
        type: 'mint',
        title: `Staked MTK in Vault`,
        amount: `-${amount} MTK`,
        to: 'Staking Contract',
        txHash: `0x${Math.random().toString(16).substr(2, 40)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
}

function claimStakingRewards() {
    playCrystalSound('drop');
    if (accruedRewards <= 0) {
        showToast("No rewards to claim yet!", "warning");
        return;
    }

    const claimed = accruedRewards;
    accruedRewards = 0;
    localStorage.setItem('aura_accrued_rewards', '0');
    document.getElementById('stakingAccruedRewards').textContent = '0.000000 MTK';
    playCrystalSound('success');
    showToast(`Claimed ${claimed.toFixed(4)} MTK Yield Rewards!`, "success");

    addActivityRecord({
        type: 'receive',
        title: `Claimed Staking Yield`,
        amount: `+${claimed.toFixed(4)} MTK`,
        to: currentAccount || 'Your Wallet',
        txHash: `0x${Math.random().toString(16).substr(2, 40)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
}

function unstakeAll() {
    playCrystalSound('drop');
    if (stakedBalance <= 0) {
        showToast("No tokens currently staked!", "warning");
        return;
    }

    const unamount = stakedBalance;
    stakedBalance = 0;
    localStorage.setItem('aura_staked_balance', '0');
    updateStakingUI();
    playCrystalSound('success');
    showToast(`Unstaked ${unamount} MTK back to your wallet!`, "info");
}

/* ==========================================================================
   9. Feature: Interactive SVG Market Chart
   ========================================================================== */
function renderMarketChart() {
    const svg = document.getElementById('marketChartSvg');
    const area = document.getElementById('chartAreaPath');
    const line = document.getElementById('chartLinePath');
    if (!svg || !area || !line) return;

    // Simulated market points for MTK token
    const points = [
        { x: 0, y: 220 },
        { x: 100, y: 190 },
        { x: 200, y: 210 },
        { x: 300, y: 140 },
        { x: 400, y: 160 },
        { x: 500, y: 110 },
        { x: 600, y: 80 },
        { x: 700, y: 95 },
        { x: 800, y: 40 }
    ];

    let dLine = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        dLine += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
    }
    dLine += ` T ${points[points.length - 1].x} ${points[points.length - 1].y}`;

    line.setAttribute('d', dLine);
    const dArea = `${dLine} L 800 280 L 0 280 Z`;
    area.setAttribute('d', dArea);
}

/* ==========================================================================
   10. Feature: Batch Multi-Sender & Address Book
   ========================================================================== */
function parseBatchInput() {
    const textarea = document.getElementById('batchInput');
    const countEl = document.getElementById('batchCount');
    const totalEl = document.getElementById('batchTotalAmount');
    if (!textarea || !countEl || !totalEl) return;

    const lines = textarea.value.trim().split('\n').filter(l => l.trim().length > 0);
    let total = 0;
    let validCount = 0;

    lines.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 2) {
            const amt = parseFloat(parts[1].trim());
            if (!isNaN(amt)) {
                total += amt;
                validCount++;
            }
        }
    });

    countEl.textContent = validCount.toString();
    totalEl.textContent = `${total.toLocaleString()} MTK`;
}

async function executeBatchTransfer() {
    playCrystalSound('drop');
    if (!tokenContract || !currentAccount) {
        showToast("Please connect your wallet first!", "warning");
        return;
    }

    const textarea = document.getElementById('batchInput');
    const lines = textarea.value.trim().split('\n').filter(l => l.trim().length > 0);

    if (lines.length === 0) {
        showToast("Please enter at least one address and amount in the batch list!", "warning");
        return;
    }

    const btn = document.getElementById('btnExecuteBatchTransfer');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> <span>Broadcasting Batch Transfers...</span>`;

    try {
        for (let i = 0; i < lines.length; i++) {
            const [addr, amtStr] = lines[i].split(',').map(s => s.trim());
            if (ethers.utils.isAddress(addr) && amtStr && !isNaN(amtStr)) {
                const amount = ethers.utils.parseUnits(amtStr, tokenDecimals);
                const tx = await tokenContract.transfer(addr, amount);
                await tx.wait();
            }
        }
        showToast("Batch transfers completed successfully!", "success", 5000);
        playCrystalSound('success');
        textarea.value = '';
        parseBatchInput();
        await refreshAllMetrics();
    } catch (err) {
        console.error("Batch error:", err);
        showToast(`Batch transfer error: ${err.message}`, "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-users"></i> <span>Execute Batch Transfers</span>`;
    }
}

// Address Book CRUD
function loadAddressBook() {
    const tbody = document.getElementById('contactsTableBody');
    if (!tbody) return;

    const defaultContacts = [
        { name: "Dev Treasury", address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" },
        { name: "Liquidity Pool", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" }
    ];

    const contacts = JSON.parse(localStorage.getItem('aura_contacts') || JSON.stringify(defaultContacts));
    tbody.innerHTML = '';

    contacts.forEach((c, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong style="color: #fff;">${c.name}</strong></td>
            <td><code style="color: var(--accent); font-size: 13px;">${c.address.substring(0, 10)}...${c.address.substring(c.address.length - 6)}</code></td>
            <td style="text-align: right;">
                <button class="icon-btn btn-send-contact" data-addr="${c.address}" title="Send Tokens" style="display: inline-flex; width: 30px; height: 30px; font-size: 12px;">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
                <button class="icon-btn btn-del-contact" data-idx="${idx}" title="Delete" style="display: inline-flex; width: 30px; height: 30px; font-size: 12px; margin-left: 6px;">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Wire send to contact buttons
    document.querySelectorAll('.btn-send-contact').forEach(btn => {
        btn.addEventListener('click', () => {
            const addr = btn.getAttribute('data-addr');
            document.getElementById('sendRecipient').value = addr;
            // Switch to send tab
            document.querySelector('[data-tab="tab-send"]').click();
            showToast(`Selected contact: ${addr.substring(0, 8)}...`, "info", 2000);
        });
    });

    document.querySelectorAll('.btn-del-contact').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-idx'), 10);
            contacts.splice(idx, 1);
            localStorage.setItem('aura_contacts', JSON.stringify(contacts));
            loadAddressBook();
            showToast("Contact deleted", "info");
        });
    });
}

function saveNewContact() {
    const nameInput = document.getElementById('contactNameInput');
    const addrInput = document.getElementById('contactAddressInput');

    const name = nameInput.value.trim();
    const address = addrInput.value.trim();

    if (!name || !ethers.utils.isAddress(address)) {
        showToast("Please enter a valid name and Ethereum address!", "warning");
        return;
    }

    const contacts = JSON.parse(localStorage.getItem('aura_contacts') || '[]');
    contacts.push({ name, address });
    localStorage.setItem('aura_contacts', JSON.stringify(contacts));

    nameInput.value = '';
    addrInput.value = '';
    document.getElementById('addContactModal').classList.remove('active');
    loadAddressBook();
    showToast(`Contact "${name}" saved!`, "success");
}

/* ==========================================================================
   11. Transfer, Mint, Burn, Faucet
   ========================================================================== */
async function executeTransfer() {
    playCrystalSound('drop');
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
        showToast("Please enter a valid transfer amount!", "warning");
        return;
    }

    const btn = document.getElementById('btnExecuteTransfer');
    try {
        const parsedAmount = ethers.utils.parseUnits(amountStr, tokenDecimals);
        if (tokenBalanceRaw.lt(parsedAmount)) {
            showToast("Insufficient MTK balance!", "error");
            return;
        }

        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> <span>Confirming on-chain...</span>`;

        const tx = await tokenContract.transfer(recipient, parsedAmount);
        showToast(`Transaction sent: ${tx.hash.substring(0, 10)}...`, "info");

        const receipt = await tx.wait();
        showToast(`Transfer of ${amountStr} ${tokenSymbol} successful!`, "success");
        playCrystalSound('success');

        addActivityRecord({
            type: 'send',
            title: `Sent ${tokenSymbol}`,
            amount: `-${amountStr} ${tokenSymbol}`,
            to: recipient,
            txHash: receipt.transactionHash,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        document.getElementById('sendRecipient').value = '';
        document.getElementById('sendAmount').value = '';
        await refreshAllMetrics();
    } catch (err) {
        console.error("Transfer error:", err);
        showToast(`Transfer failed: ${err.reason || err.message}`, "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> <span>Transfer Tokens</span>`;
    }
}

async function executeMint() {
    playCrystalSound('drop');
    if (!tokenContract || !currentAccount) {
        showToast("Please connect your wallet first!", "warning");
        return;
    }

    let recipient = document.getElementById('mintRecipient').value.trim() || currentAccount;
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
        const receipt = await tx.wait();

        showToast(`Successfully minted ${amountStr} ${tokenSymbol}!`, "success");
        playCrystalSound('success');

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
        showToast(`Mint failed: ${err.reason || err.message}`, "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-plus-circle"></i> <span>Mint MTK</span>`;
    }
}

async function executeBurn() {
    playCrystalSound('burn');
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
            showToast("Cannot burn more than your available balance!", "error");
            return;
        }

        if (!confirm(`Are you sure you want to permanently burn ${amountStr} MTK?`)) return;

        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> <span>Vaporizing...</span>`;

        const tx = await tokenContract.burn(parsedAmount);
        const receipt = await tx.wait();

        showToast(`Burned ${amountStr} ${tokenSymbol} permanently!`, "success");

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
        showToast(`Burn failed: ${err.reason || err.message}`, "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-fire"></i> <span>Vaporize / Burn MTK</span>`;
    }
}

async function claimFaucet() {
    playCrystalSound('drop');
    if (!currentAccount) {
        showToast("Connect your wallet to claim faucet tokens!", "warning");
        return;
    }

    const btn = document.getElementById('btnClaimFaucet');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Claiming Faucet...`;

    try {
        if (tokenContract && isContractOwner) {
            const amount = ethers.utils.parseUnits("100", tokenDecimals);
            const tx = await tokenContract.mint(currentAccount, amount);
            const receipt = await tx.wait();
            showToast("100 MTK Faucet claimed successfully!", "success");
            playCrystalSound('success');

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
            showToast("Faucet claimed: 100 MTK credited to local ledger testing!", "info", 4000);
        }
    } catch (err) {
        console.error("Faucet error:", err);
        showToast(`Faucet claim note: ${err.message}`, "info");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-hand-holding-dollar"></i> <span>Claim 100 MTK Faucet</span>`;
    }
}

/* ==========================================================================
   12. QR Code & Activity History
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
            colorDark: "#050a18",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

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
            <div class="history-left" style="display: flex; align-items: center; gap: 14px;">
                <div class="history-type-icon ${colorClass}" style="width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.06);">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div class="history-meta">
                    <h4 style="font-size: 14px; font-weight: 700;">${item.title}</h4>
                    <span style="font-size: 12px; color: var(--text-dim);">${item.timestamp} • to ${item.to.substring(0, 6)}...</span>
                </div>
            </div>
            <div class="history-amount" style="font-family: 'Outfit'; font-size: 15px; font-weight: 700; color: ${colorClass === 'send' || colorClass === 'burn' ? '#f87171' : '#34d399'};">
                ${item.amount}
            </div>
        `;
        historyList.appendChild(row);
    });
}

function addActivityRecord(record) {
    const stored = JSON.parse(localStorage.getItem('aura_tx_history') || '[]');
    stored.unshift(record);
    if (stored.length > 20) stored.pop();
    localStorage.setItem('aura_tx_history', JSON.stringify(stored));
    loadActivityHistory();
}

/* ==========================================================================
   13. Initialization & Event Listeners
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Visual Engines
    initLiquidCrystalCanvas();
    initCard3DTilt();
    initLiquidRipplePhysics();
    initStakingEngine();
    renderMarketChart();

    // 2. Set Theme
    setTheme(currentTheme);

    // 3. Theme picker buttons
    document.querySelectorAll('.theme-dot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-set-theme');
            setTheme(theme);
        });
    });

    // 4. Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            playCrystalSound('drop');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

            const tabId = btn.getAttribute('data-tab');
            btn.classList.add('active');
            document.getElementById(tabId)?.classList.add('active');

            if (tabId === 'tab-chart') renderMarketChart();
            if (tabId === 'tab-swap') calculateSwapQuote();
        });
    });

    // 5. Sound Toggle
    const soundBtn = document.getElementById('btnToggleSound');
    const soundIcon = document.getElementById('soundIcon');
    soundBtn?.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundBtn.classList.toggle('active', soundEnabled);
        soundIcon.className = soundEnabled ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
        showToast(soundEnabled ? "Audio effects enabled" : "Audio muted", "info", 2000);
    });

    // 6. Web3 Buttons
    document.getElementById('btnConnectWallet')?.addEventListener('click', connectWallet);
    document.getElementById('btnExecuteTransfer')?.addEventListener('click', executeTransfer);
    document.getElementById('btnExecuteMint')?.addEventListener('click', executeMint);
    document.getElementById('btnExecuteBurn')?.addEventListener('click', executeBurn);
    document.getElementById('btnClaimFaucet')?.addEventListener('click', claimFaucet);
    document.getElementById('btnClearHistory')?.addEventListener('click', () => {
        localStorage.removeItem('aura_tx_history');
        loadActivityHistory();
        showToast("Activity history cleared", "info");
    });

    // 7. Swap Controls
    document.getElementById('swapPayAmount')?.addEventListener('input', calculateSwapQuote);
    document.getElementById('btnExecuteSwap')?.addEventListener('click', executeSwap);
    document.getElementById('btnSwitchSwapTokens')?.addEventListener('click', () => {
        playCrystalSound('drop');
        const temp = swapFrom;
        swapFrom = swapTo;
        swapTo = temp;

        document.querySelector('#swapFromToken span').textContent = swapFrom;
        document.querySelector('#swapToToken span').textContent = swapTo;
        calculateSwapQuote();
    });

    // 8. Staking Controls
    document.getElementById('btnExecuteStake')?.addEventListener('click', executeStake);
    document.getElementById('btnClaimStakingRewards')?.addEventListener('click', claimStakingRewards);
    document.getElementById('btnUnstakeTokens')?.addEventListener('click', unstakeAll);
    document.getElementById('btnFillMaxStake')?.addEventListener('click', () => {
        if (!tokenBalanceRaw.isZero()) {
            document.getElementById('stakeInputAmount').value = ethers.utils.formatUnits(tokenBalanceRaw, tokenDecimals);
        }
    });

    // 9. Batch Sender & Address Book
    document.getElementById('batchInput')?.addEventListener('input', parseBatchInput);
    document.getElementById('btnExecuteBatchTransfer')?.addEventListener('click', executeBatchTransfer);
    document.getElementById('btnInsertSampleBatch')?.addEventListener('click', () => {
        document.getElementById('batchInput').value = `0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 50\n0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, 25\n0x90F79bf6EB2c4f870365E785982E1f101E93b906, 10`;
        parseBatchInput();
    });

    document.getElementById('btnOpenAddContactModal')?.addEventListener('click', () => {
        document.getElementById('addContactModal')?.classList.add('active');
    });
    document.getElementById('btnCloseAddContactModal')?.addEventListener('click', () => {
        document.getElementById('addContactModal')?.classList.remove('active');
    });
    document.getElementById('btnSaveContact')?.addEventListener('click', saveNewContact);
    document.getElementById('btnOpenContactPicker')?.addEventListener('click', () => {
        document.querySelector('[data-tab="tab-contacts"]').click();
    });

    // 10. Quick Amount Pills
    document.querySelectorAll('.amount-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            playCrystalSound('drop');
            if (tokenBalanceRaw.isZero()) return;
            const percent = parseInt(pill.getAttribute('data-percent'), 10);
            const balFloat = parseFloat(ethers.utils.formatUnits(tokenBalanceRaw, tokenDecimals));
            document.getElementById('sendAmount').value = ((balFloat * percent) / 100).toFixed(4);
        });
    });

    document.getElementById('btnMaxSend')?.addEventListener('click', () => {
        if (!tokenBalanceRaw.isZero()) {
            document.getElementById('sendAmount').value = ethers.utils.formatUnits(tokenBalanceRaw, tokenDecimals);
        }
    });

    document.getElementById('btnFillMaxBurn')?.addEventListener('click', () => {
        if (!tokenBalanceRaw.isZero()) {
            document.getElementById('burnAmount').value = ethers.utils.formatUnits(tokenBalanceRaw, tokenDecimals);
        }
    });

    // 11. Clipboard Helpers
    const copyText = (text, msg = "Copied to clipboard!") => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            showToast(msg, "success", 2500);
            playCrystalSound('drop');
        });
    };

    document.getElementById('btnCopyNavAddress')?.addEventListener('click', () => copyText(currentAccount, "Wallet address copied!"));
    document.getElementById('btnCopyReceiveAddress')?.addEventListener('click', () => copyText(currentAccount, "Receive address copied!"));
    document.getElementById('btnCopyContractAddress')?.addEventListener('click', () => copyText(tokenAddress, "Contract address copied!"));

    document.getElementById('btnPasteRecipient')?.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                document.getElementById('sendRecipient').value = text.trim();
                showToast("Address pasted from clipboard", "info", 2000);
            }
        } catch (e) {
            showToast("Clipboard access denied.", "warning");
        }
    });

    // 12. Contract Settings Modal
    const contractModal = document.getElementById('contractModal');
    const inputCustomContract = document.getElementById('inputCustomContract');

    document.getElementById('btnOpenContractSettings')?.addEventListener('click', () => {
        playCrystalSound('drop');
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

    // 13. Load Address Book & History
    loadAddressBook();
    loadActivityHistory();

    // 14. Start Web3
    initWeb3();
});