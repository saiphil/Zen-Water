// Variables
const timeElement = document.getElementById('time');
const quoteElement = document.getElementById('quote');
const authorElement = document.getElementById('author');
const waterContainer = document.getElementById('water-container');
const counterElement = document.getElementById('counter');
const alarmSound = document.getElementById('alarm-sound');
const bubblesContainer = document.getElementById('bubbles-container');

let alarmCount = parseInt(localStorage.getItem('alarmCount')) || 0;
let lastAlarmMinute = -1;
let waterHeight = parseFloat(localStorage.getItem('waterHeight')) || 0;
let lastCheckedDate = new Date().getUTCDate(); // Track the last checked date
let lastFetchedQuote = JSON.parse(localStorage.getItem('lastFetchedQuote')) || { 
    text: "Time is the most valuable thing a man can spend.", 
    author: "Theophrastus" 
};

function checkForMidnightReset() {
    const currentDate = new Date().getUTCDate(); // Get today's date

    if (currentDate !== lastCheckedDate) {
        // The day has changed → Reset progress
        resetProgress();
        lastCheckedDate = currentDate; // Update the last checked date
        console.log("🌙 Midnight reset completed! Progress has been reset.");
    }
}


// Request notification permission on page load
function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            console.log("Notification permission:", permission);
        });
    }
}

// Call this function when the page loads
window.addEventListener('load', requestNotificationPermission);

// Restore UI state
function restoreProgress() {
    counterElement.textContent = `Alarms: ${alarmCount}/12`;
    waterContainer.style.transition = "height 2s ease-out";
    setTimeout(() => {
    waterContainer.style.transition = 'height 2s ease-out';
    waterContainer.style.height = `${waterHeight}vh`;
}, 50);
    quoteElement.textContent = lastFetchedQuote.text;
    authorElement.textContent = lastFetchedQuote.author ? `- ${lastFetchedQuote.author}` : "";
}

// 1. Updated time display function to include leading zeros for hours
function updateSGTTime() {
    const now = new Date();
    // SGT is UTC+8
    const sgtTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));

    let hours = sgtTime.getUTCHours();
    const minutes = sgtTime.getUTCMinutes().toString().padStart(2, '0');
    const seconds = sgtTime.getUTCSeconds().toString().padStart(2, '0');

    // Convert to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 (midnight) and 12 (noon) correctly
    
    // Add leading zero to hours if single digit
    const hoursFormatted = hours.toString().padStart(2, '0');

    // Change background based on time of day
    changeBackground(sgtTime.getUTCHours());

    // Update the time display
    timeElement.textContent = `${hoursFormatted}:${minutes}:${seconds} ${period}`;

    // Check for alarm (every 30 minutes)
    const currentMinute = sgtTime.getUTCMinutes();
    if ((currentMinute === 0 || currentMinute === 30) && currentMinute !== lastAlarmMinute) {
        triggerAlarm();
        lastAlarmMinute = currentMinute;
    }    

    // Update text colors based on water level
    updateTextColors();
}

// 2. Enhanced background color based on time
function changeBackground(hour) {
    const body = document.body;
    let targetColor;

    if (hour >= 6 && hour < 12) {
        // Morning (6AM - 12PM)
        targetColor = "#F8B595";
        updateWelcomeMessage("Good Morning.");
    } else if (hour >= 12 && hour < 18) {
        // Afternoon (12PM - 6PM)
        targetColor = "#F67280";
        updateWelcomeMessage("Good Afternoon.");
    } else if (hour >= 18 && hour < 21) {
        // Evening (6PM - 9PM)
        targetColor = "#C06C84";
        updateWelcomeMessage("Good Evening.");
    } else if (hour >= 21 && hour < 24) {
        // Night (9PM - 12AM)
        targetColor = "#6C5B7C";
        updateWelcomeMessage("Time to Rest.");
    } else {
        // Late Night (12AM - 6AM)
        targetColor = "#355C7D";
        updateWelcomeMessage("Sleep Well.");
    }

    // Smooth transition to new color
    body.style.transition = "background-color 2s ease";
    body.style.backgroundColor = targetColor;
}

// 3. Function to update welcome message based on time
function updateWelcomeMessage(message) {
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        welcomeMessage.textContent = message;
    }
}

// Run background update on load
window.addEventListener('load', () => {
    updateSGTTime();
    setInterval(updateSGTTime, 1000);
});

// Function to trigger the alarm
function triggerAlarm() {
    if (alarmCount < 12) {
        // Reset when it reaches 12 alarms
        if (alarmCount + 1 === 12) {
            setTimeout(resetProgress, 5000);
        }
        const alarmSound = document.getElementById('alarm-sound');

        // Loop the alarm sound for 5 seconds
        let playCount = 0;
        const playInterval = setInterval(() => {
            alarmSound.currentTime = 0; // Restart sound
            alarmSound.play().catch(error => console.error("Error playing sound:", error));

            playCount++;
            if (playCount >= 3) { // Stop after 5 seconds
                clearInterval(playInterval);
            }
        }, 1000); // Play every second

        alarmCount++;
        waterHeight = (alarmCount / 12) * 100;

        counterElement.textContent = `Alarms: ${alarmCount}/12`;
        setTimeout(() => {
    waterContainer.style.transition = 'height 2s ease-out';
    waterContainer.style.height = `${waterHeight}vh`;
}, 50);
        // Save progress
        localStorage.setItem('alarmCount', alarmCount);
        localStorage.setItem('waterHeight', waterHeight);

        requestAnimationFrame(() => { createBubbles(10);

document.querySelectorAll('.wave').forEach(wave => {
    wave.style.animation = "none"; // Reset animation
    void wave.offsetWidth; // Force browser to reprocess it
    wave.style.animation = ""; // Restore animation
});
 });
        fetchQuote();

        // Show alert message
        const alertMessage = document.getElementById('alert-message');
        alertMessage.style.display = "block";

        console.log("Alert message displayed!"); // Debugging

        // Send browser notification
        sendNotification("⏰ Time to Drink Water!", "Stay hydrated, Chuchu!");

        // Hide the message after 1 minute
        setTimeout(() => {
            alertMessage.style.display = "none";
            console.log("Alert message hidden!"); // Debugging
        }, 30000);

        // If goal is reached, reset after a delay
        if (alarmCount === 12) {
            setTimeout(resetProgress, 5000); // 5 sec delay before reset
        }
    }
}

// 4. Fixed reset progress function to use "Water Intake Today" label
function resetProgress() {
    alarmCount = 0;
    waterHeight = 0;
    
    // Reset UI smoothly
    waterContainer.style.transition = "height 2s ease-out";
    waterContainer.style.height = "0vh";
    counterElement.textContent = "Water Intake Today: 0/12";

    // Clear stored data
    localStorage.removeItem('alarmCount');
    localStorage.removeItem('waterHeight');

    // Clear all localStorage data
    localStorage.clear();

    console.log("Progress and localStorage have been reset.");
}

// Function to create bubbles
function createBubbles(count) {
    for (let i = 0; i < count; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');

        const size = Math.random() * 25 + 5;
        const left = Math.random() * 100;
        const animDuration = Math.random() * 10 + 5;
        const delay = Math.random() * 5;

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.bottom = `-${size}px`;
        bubble.style.animationDuration = `${animDuration}s`;
        bubble.style.animationDelay = `${delay}s`;

        bubblesContainer.appendChild(bubble);

        setTimeout(() => {
            if (bubblesContainer.contains(bubble)) {
                bubblesContainer.removeChild(bubble);
            }
        }, (animDuration + delay) * 1000);
    }
}

// Function to fetch a quote
async function fetchQuote() {
    try {
        simulateQuoteAPI();
    } catch (error) {
        console.error('Error fetching quote:', error);
        quoteElement.textContent = lastFetchedQuote.text;
        authorElement.textContent = lastFetchedQuote.author ? `- ${lastFetchedQuote.author}` : "";
    }
}

// Function to simulate fetching quotes
function simulateQuoteAPI() {
    const quotes = [
        { text: "The two most powerful warriors are patience and time.", author: "Leo Tolstoy" },
        { text: "Time you enjoy wasting is not wasted time.", author: "Marthe Troly-Curtin" },
        { text: "Time is what we want most, but what we use worst.", author: "William Penn" },
        { text: "Yesterday is gone. Tomorrow has not yet come. We have only today.", author: "Mother Teresa" },
        { text: "Time is the wisest counselor of all.", author: "Pericles" }
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    quoteElement.style.opacity = 0;
    authorElement.style.opacity = 0;

    setTimeout(() => {
        quoteElement.textContent = randomQuote.text;
        authorElement.textContent = randomQuote.author ? `- ${randomQuote.author}` : "";

        quoteElement.style.opacity = 1;
        authorElement.style.opacity = 1;

        lastFetchedQuote = randomQuote;
        localStorage.setItem('lastFetchedQuote', JSON.stringify(randomQuote));
    }, 500);
}

// Function to update text colors based on water level
function updateTextColors() {
    const waterHeight = parseFloat(waterContainer.style.height || 0);
    const timeContainerRect = document.getElementById('time-container').getBoundingClientRect();
    const quoteContainerRect = document.getElementById('quote-container').getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const waterLevel = (waterHeight / 100) * windowHeight;

    if (waterLevel > timeContainerRect.top) {
        timeElement.style.color = 'white';
        counterElement.style.color = 'white';
    } else {
        timeElement.style.color = 'black';
        counterElement.style.color = 'black';
    }

    if (waterLevel > quoteContainerRect.top) {
        quoteElement.style.color = 'white';
        authorElement.style.color = 'white';
    } else {
        quoteElement.style.color = 'black';
        authorElement.style.color = 'black';
    }
}

// 5. Improved notification permission handling
function handleNotificationPermission() {
    if ("Notification" in window) {
        // Check if permission was previously asked
        const notificationStatus = localStorage.getItem('notificationPermission');
        
        if (notificationStatus === 'granted') {
            console.log("Notifications already permitted");
            return;
        } else if (notificationStatus === 'denied' || notificationStatus === 'default') {
            // Show notification permission button/popup
            showNotificationPrompt();
        } else {
            // First time visitor
            showNotificationPrompt();
        }
    }
}

function showNotificationPrompt() {
    const promptContainer = document.createElement('div');
    promptContainer.id = 'notification-prompt';
    promptContainer.innerHTML = `
        <div class="notification-message">
            <p>Enable notifications for water reminders?</p>
            <div class="notification-buttons">
                <button id="enable-notifications">Yes</button>
                <button id="disable-notifications">No</button>
            </div>
        </div>
    `;
    document.body.appendChild(promptContainer);
    
    document.getElementById('enable-notifications').addEventListener('click', function() {
        Notification.requestPermission().then(permission => {
            localStorage.setItem('notificationPermission', permission);
            promptContainer.style.display = 'none';
        });
    });
    
    document.getElementById('disable-notifications').addEventListener('click', function() {
        localStorage.setItem('notificationPermission', 'denied');
        promptContainer.style.display = 'none';
    });
}

// 6. Always show some bubbles for ambient effect
function createAmbientBubbles() {
    setInterval(() => {
        createBubbles(1); // Create a single bubble every few seconds
    }, 3000);
}

// 7. Added volume control
function addVolumeControl() {
    const volumeControl = document.createElement('div');
    volumeControl.id = 'volume-control';
    volumeControl.innerHTML = `
        <div class="volume-icon">🔊</div>
        <input type="range" id="volume-slider" min="0" max="1" step="0.1" value="0.5">
    `;
    document.body.appendChild(volumeControl);
    
    const volumeSlider = document.getElementById('volume-slider');
    const volumeIcon = document.querySelector('.volume-icon');
    
    // Restore volume from localStorage or set default
    const savedVolume = localStorage.getItem('volume') || 0.5;
    volumeSlider.value = savedVolume;
    alarmSound.volume = savedVolume;
    
    volumeSlider.addEventListener('input', function() {
        alarmSound.volume = this.value;
        localStorage.setItem('volume', this.value);
        
        // Update icon based on volume level
        if (this.value == 0) {
            volumeIcon.textContent = '🔇';
        } else if (this.value < 0.5) {
            volumeIcon.textContent = '🔉';
        } else {
            volumeIcon.textContent = '🔊';
        }
    });
}

// 8. Create splash screen
function createSplashScreen() {
    const splash = document.createElement('div');
    splash.id = 'splash-screen';
    
    // Get current hour to set appropriate message and background
    const now = new Date();
    const sgtTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const hour = sgtTime.getUTCHours();
    
    let welcomeMessage = "Good Morning.";
    let bgColor = "#F8B595";
    
    if (hour >= 12 && hour < 18) {
        welcomeMessage = "Good Afternoon.";
        bgColor = "#F67280";
    } else if (hour >= 18 && hour < 21) {
        welcomeMessage = "Good Evening.";
        bgColor = "#C06C84";
    } else if (hour >= 21 && hour < 24) {
        welcomeMessage = "Time to Rest.";
        bgColor = "#6C5B7C";
    } else if (hour >= 0 && hour < 6) {
        welcomeMessage = "Sleep Well.";
        bgColor = "#355C7D";
    }
    
    splash.style.backgroundColor = bgColor;
    
    splash.innerHTML = `
        <div id="welcome-message">${welcomeMessage}</div>
        <div id="app-name">zen_water</div>
        <div id="creator">created by: pink_salamndr</div>
    `;
    
    document.body.appendChild(splash);
    
    // Fade out splash screen after 5 seconds
    setTimeout(() => {
        splash.style.opacity = 0;
        
        // Remove splash after animation completes and show main content
        setTimeout(() => {
            splash.remove();
            document.getElementById('time-container').style.opacity = 1;
            document.getElementById('quote-container').style.opacity = 1;
            if (waterHeight > 0) {
                waterContainer.style.opacity = 1;
            }
        }, 1000);
    }, 5000);
}

// Initialize the app
function init() {
    // Hide main content initially
    document.getElementById('time-container').style.opacity = 0;
    document.getElementById('quote-container').style.opacity = 0;
    waterContainer.style.opacity = 0;
    
    // Show splash screen
    createSplashScreen();
    
    // Initialize regular functionality
    restoreProgress();
    updateSGTTime();
    setInterval(updateSGTTime, 1000);
    setInterval(checkForMidnightReset, 60000); // Check for midnight reset every minute
    fetchQuote();
    window.addEventListener('resize', updateTextColors);
    
    // Add new functionality
    handleNotificationPermission();
    createAmbientBubbles();
    addVolumeControl();
    
    // Fade in main content after splash screen
    setTimeout(() => {
        document.getElementById('time-container').style.transition = "opacity 1s ease";
        document.getElementById('quote-container').style.transition = "opacity 1s ease";
        waterContainer.style.transition = "opacity 1s ease";
    }, 5000);
    
    document.body.addEventListener('click', () => {
        triggerAlarm();
    });
}

window.addEventListener('load', init);
