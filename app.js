// Main application file that initializes the app and handles core functionality

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initApp();

    // Setup event listeners
    setupEventListeners();

    // Update date and time
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
});

function initApp() {
    // Get user's location for weather
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherData(latitude, longitude);
                fetchClimateData(latitude, longitude);
            },
            error => {
                console.error('Error getting location:', error);
                // Default to a major city if location access is denied
                fetchWeatherData(40.7128, -74.0060); // New York
                fetchClimateData(40.7128, -74.0060);
            }
        );
    } else {
        console.log('Geolocation is not supported by this browser');
        fetchWeatherData(40.7128, -74.0060); // Default to New York
        fetchClimateData(40.7128, -74.0060);
    }

    // Initialize the chatbot
    initChatBot();
}

function setupEventListeners() {
    // Chat input handling
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Send message on button click
    sendButton.addEventListener('click', () => {
        sendUserMessage();
    });

    // Send message on Enter key press
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendUserMessage();
        }
    });

    // Focus input when chat container is clicked
    document.getElementById('chat-messages').addEventListener('click', () => {
        userInput.focus();
    });
}

function sendUserMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (message) {
        // Add user message to chat
        addMessageToChat('user', message);
        
        // Clear input field
        userInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Process message with chatbot
        processMessage(message);
    }
}

function addMessageToChat(sender, message, isWeatherCard = false) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    let iconClass = sender === 'user' ? 'fa-user' : 'fa-robot';
    let bgColor = sender === 'user' ? 'bg-blue-500' : 'bg-blue-100';
    let iconColor = sender === 'user' ? 'text-white' : 'text-blue-500';
    let messageBg = sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700';
    
    let messageHTML = '';
    
    if (isWeatherCard) {
        // Special formatting for weather card responses
        messageHTML = `
            <div class="flex items-start mb-4">
                <div class="w-8 h-8 rounded-full ${bgColor} flex items-center justify-center mr-3">
                    <i class="fas ${iconClass} ${iconColor} text-sm"></i>
                </div>
                <div class="bg-white rounded-lg p-3 shadow-md max-w-xs md:max-w-md w-full">
                    ${message}
                </div>
            </div>
        `;
    } else {
        // Standard message format
        messageHTML = `
            <div class="flex items-start mb-4">
                <div class="w-8 h-8 rounded-full ${bgColor} flex items-center justify-center mr-3">
                    <i class="fas ${iconClass} ${iconColor} text-sm"></i>
                </div>
                <div class="${messageBg} rounded-lg p-3 shadow max-w-xs md:max-w-md">
                    <p>${message}</p>
                </div>
            </div>
        `;
    }
    
    messageDiv.innerHTML = messageHTML;
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing-indicator-container';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="flex items-start mb-4">
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <i class="fas fa-robot text-blue-500 text-sm"></i>
            </div>
            <div class="bg-white rounded-lg p-3 shadow max-w-xs">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function updateDateTime() {
    const dateTimeElement = document.getElementById('date-time');
    const now = new Date();
    
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    dateTimeElement.textContent = now.toLocaleDateString('en-US', options);
}

// Error handling function
function handleError(error, fallbackMessage) {
    console.error(error);
    return fallbackMessage || "I'm having trouble processing that right now. Please try again later.";
}