// Binary Background
const canvas = document.getElementById('binary-background');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const binary = ['0', '1'];
const fontSize = 14;
const columns = Math.floor(canvas.width / fontSize);
const drops = new Array(columns).fill(1);

function drawBinary() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff0000';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
        const text = binary[Math.floor(Math.random() * binary.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawBinary, 33);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Eye Movement
const eye = document.getElementById('devil-eye');
const pupil = document.getElementById('pupil');

document.addEventListener('mousemove', (e) => {
    const eyeRect = eye.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    const dx = e.clientX - eyeCenterX;
    const dy = e.clientY - eyeCenterY;

    const angle = Math.atan2(dy, dx);
    const maxDistance = (eyeRect.width - 60) / 2; // 60 is the pupil width
    const distance = Math.min(maxDistance, Math.sqrt(dx * dx + dy * dy));

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
});

// Crypto Miner
let tokens = 0;
let clickPower = 1;
let upgradeCost = 10;
let withdrawableTokens = 0;
let walletAddress = null;

const tokenCountElement = document.getElementById('token-count');
const miningPowerElement = document.getElementById('mining-power');
const upgradeCostElement = document.getElementById('upgrade-cost');
const withdrawableTokensElement = document.getElementById('withdrawable-tokens');

function saveTokens() {
    if (walletAddress) {
        localStorage.setItem(walletAddress, JSON.stringify({ tokens, clickPower, upgradeCost }));
    }
}

function loadTokens() {
    if (walletAddress) {
        const savedData = localStorage.getItem(walletAddress);
        if (savedData) {
            const data = JSON.parse(savedData);
            tokens = data.tokens;
            clickPower = data.clickPower;
            upgradeCost = data.upgradeCost;
        }
    }
}

document.getElementById('mine-button').addEventListener('click', () => {
    tokens += clickPower / 10;
    saveTokens();
    updateDisplay();
});

document.getElementById('upgrade-button').addEventListener('click', () => {
    if (tokens >= upgradeCost) {
        tokens -= upgradeCost;
        clickPower++;
        upgradeCost = Math.floor(upgradeCost * 1.5);
        saveTokens();
        updateDisplay();
    }
});

document.getElementById('withdraw-button').addEventListener('click', () => {
    withdrawableTokens += tokens;
    tokens = 0;
    saveTokens();
    updateDisplay();
});

function updateDisplay() {
    tokenCountElement.textContent = tokens.toFixed(2);
    miningPowerElement.textContent = clickPower;
    upgradeCostElement.textContent = upgradeCost.toFixed(2);
    withdrawableTokensElement.textContent = withdrawableTokens.toFixed(2);
}

setInterval(() => {
    tokens += clickPower / 100;
    saveTokens();
    updateDisplay();
}, 1000);

// Phantom Wallet Integration
const connectWalletButton = document.getElementById('connect-wallet');
const chatbotSection = document.querySelector('.chatbot-section');

connectWalletButton.addEventListener('click', async () => {
    if (window.solana && window.solana.isPhantom) {
        try {
            const resp = await window.solana.connect();
            walletAddress = resp.publicKey.toString();
            console.log('Connected with Public Key:', walletAddress);

            loadTokens();
            updateDisplay();
            chatbotSection.style.display = 'block';
            connectWalletButton.style.display = 'none';
        } catch (err) {
            console.error('Error connecting to Phantom wallet:', err);
        }
    } else {
        alert('Phantom wallet not detected. Please install Phantom wallet to continue.');
    }
});

// Chatbot Logic with Hugging Face API Integration
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSendButton = document.getElementById('chatbot-send');

chatbotSendButton.addEventListener('click', async () => {
    const userMessage = chatbotInput.value.trim();
    if (userMessage) {
        addMessage('You', userMessage);
        chatbotInput.value = '';

        // Call backend server for a response
        const response = await getChatbotResponse(userMessage);
        addMessage('Jevana AI', response);
    }
});

async function getChatbotResponse(userMessage) {
    const endpoint = '/api/chatbot'; // Backend server URL

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend API Error:', errorText);
            return 'Sorry, I encountered an error while processing your request.';
        }

        const data = await response.json();
        console.log('Backend API Response:', data); // Debugging log
        return data.generated_text || 'Sorry, I could not generate a response.';
    } catch (error) {
        console.error('Error calling Backend API:', error);
        return 'Sorry, I encountered an error while processing your request.';
    }
}

function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${sender}: ${message}`;
    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Check if Phantom wallet is installed
if (typeof window.solana === 'undefined' || !window.solana.isPhantom) {
    console.warn("Phantom wallet is not installed or not detected.");
    alert("Phantom wallet is not installed or not detected. Please install Phantom wallet to continue.");
} else {
    console.log("Phantom wallet is installed and detected.");
}