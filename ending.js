// Ending Page JavaScript

// Birthday messages to display sequentially
const birthdayMessages = [
    "June has completed her journey of discovery!",
    "But June will face many journeys in life.",
    "Be prepared.",
    "I might not always be here, but I will always be with you.",
    "Life is tough and boring.",
    "But good musics can make it better.",
    "Maybe with some ice cream.",
    "Then life could be dream",
    "Wish you a happy birthday, June!",
    "PS: This font is my favorite. I made it myself.",
    "So take it as if my handwriting is the style of my thoughts. The only way I could seal my love to last longer than my mind."
];

let currentMessageIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const messageText = document.getElementById('message-text');
    const previousText = document.getElementById('previous-text');
    const nextText = document.getElementById('next-text');
    
    // Function to update all text displays with smooth rolling animation
    function updateDisplay(direction = 'forward') {
        // Disable buttons during animation
        rightBtn.disabled = true;
        leftBtn.disabled = true;
        
        // Create rolling effect by animating individual text elements
        const animationOffset = direction === 'forward' ? -30 : 30;
        const fadeOutDuration = 200;
        const fadeInDuration = 300;
        
        // Fade out and move current texts
        [previousText, messageText, nextText].forEach((element, index) => {
            element.style.transition = `opacity ${fadeOutDuration}ms ease, transform ${fadeOutDuration}ms ease`;
            element.style.opacity = '0';
            element.style.transform = `translateY(${animationOffset}px)`;
        });
        
        // Update content and fade in after fade out completes
        setTimeout(() => {
            // Update main message
            messageText.textContent = birthdayMessages[currentMessageIndex];
            
            // Update previous message (above)
            if (currentMessageIndex > 0) {
                previousText.textContent = birthdayMessages[currentMessageIndex - 1];
            } else {
                previousText.textContent = '';
            }
            
            // Update next message (below)
            if (currentMessageIndex < birthdayMessages.length - 1) {
                nextText.textContent = birthdayMessages[currentMessageIndex + 1];
            } else {
                nextText.textContent = '';
            }
            
            // Show/hide left button
            if (currentMessageIndex > 0) {
                leftBtn.style.display = 'block';
            } else {
                leftBtn.style.display = 'none';
            }
            
            // Fade in and reset position
            [previousText, messageText, nextText].forEach((element, index) => {
                element.style.transition = `opacity ${fadeInDuration}ms ease, transform ${fadeInDuration}ms ease`;
                element.style.opacity = element === messageText ? '1' : '0.3';
                element.style.transform = 'translateY(0)';
            });
            
            // Re-enable buttons after animation completes
            setTimeout(() => {
                rightBtn.disabled = false;
                leftBtn.disabled = false;
            }, fadeInDuration);
            
        }, fadeOutDuration);
    }
    
    // Function to show the next message
    function showNextMessage() {
        if (currentMessageIndex < birthdayMessages.length - 1) {
            currentMessageIndex++;
            updateDisplay('forward');
        } else {
            // All messages shown, go to real ending page
            window.location.href = 'real-ending.html';
        }
    }
    
    // Function to show the previous message
    function showPreviousMessage() {
        if (currentMessageIndex > 0) {
            currentMessageIndex--;
            updateDisplay('backward');
        }
    }
    
    // Initialize display without animation
    messageText.textContent = birthdayMessages[currentMessageIndex];
    if (birthdayMessages.length > 1) {
        nextText.textContent = birthdayMessages[1];
    }
    leftBtn.style.display = 'none';
    
    // Handle button clicks
    rightBtn.addEventListener('click', showNextMessage);
    leftBtn.addEventListener('click', showPreviousMessage);
    
    // Add keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
            e.preventDefault();
            showNextMessage();
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            showPreviousMessage();
        } else if (e.code === 'Escape') {
            e.preventDefault();
            window.location.href = 'index.html';
        }
    });
    
    // Touch support for mobile
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
    });
    
    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        showNextMessage();
    });
    
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
    });
    
    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        showPreviousMessage();
    });
});

// Prevent scrolling on mobile
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });
