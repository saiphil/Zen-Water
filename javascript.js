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
let lastFetchedQuote = JSON.parse(localStorage.getItem('lastFetchedQuote')) || { 
    text: "Time is the most valuable thing a man can spend.", 
    author: "Theophrastus" 
};

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
    waterContainer.style.height = `${waterHeight}vh`;
    quoteElement.textContent = lastFetchedQuote.text;
    authorElement.textContent = lastFetchedQuote.author ? `- ${lastFetchedQuote.author}` : "";
}

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

     // Change background based on time of day
     changeBackground(sgtTime.getUTCHours());

    // Update the time display
    timeElement.textContent = `${hours}:${minutes}:${seconds} ${period}`;

    // Check for alarm (every 30 minutes)
    const currentMinute = sgtTime.getUTCMinutes();
    if ((currentMinute === 0 || currentMinute === 30) && currentMinute !== lastAlarmMinute) {
        triggerAlarm();
        lastAlarmMinute = currentMinute;
    }    

    // Update text color based on water level
    updateTextColors();
}

// Function to change background color based on time
function changeBackground(hour) {
    const body = document.body;

    if (hour >= 6 && hour < 16) {
        // Morning - Afternoon (6AM - 4PM)
        body.style.backgroundColor = "#ffffff"; // White
    } else if (hour >= 16 && hour < 18) {
        // Evening (4PM - 6PM)
        body.style.backgroundColor = "#ffedd5"; // Warm white
    } else {
        // Night (6PM - 6AM)
        body.style.backgroundColor = "#1e293b"; // Dark
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
        waterContainer.style.height = `${waterHeight}vh`;
        // Save progress
        localStorage.setItem('alarmCount', alarmCount);
        localStorage.setItem('waterHeight', waterHeight);

        createBubbles(15);
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

// Function to reset progress
function resetProgress() {
    alarmCount = 0;
    waterHeight = 0;
    
    // Reset UI smoothly
    waterContainer.style.transition = "height 2s ease-out";
    waterContainer.style.height = "0vh";
    counterElement.textContent = "Water Intake Today: 0/12";;

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

function sendNotification(title, message) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
            body: message,
            icon: "https://cdn-icons-png.flaticon.com/512/883/883746.png" // Optional icon
        });
    } else {
        console.log("Notifications are blocked or not supported.");
    }
}

// Initialize the app
function init() {
    restoreProgress();
    updateSGTTime();
    setInterval(updateSGTTime, 1000);
    fetchQuote();
    window.addEventListener('resize', updateTextColors);

//   document.body.addEventListener('click', () => {
//        if (alarmCount < 12) {
//            triggerAlarm();
//        }
//    });

}

window.addEventListener('load', init);
