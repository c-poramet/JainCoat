// Real Ending Page JavaScript

// Real ending messages to display sequentially
const realEndingMessages = [
    "Of course, As if it was some kind of an inside joke.",
    "I wish to write you out all the reasons I love you, but I can't. Today I got DND sessions with our friends.",
    "If I could, I would still need a deck of cards with thounsands of cards and a pen that never runs out of ink.",
    "So let's try to keep it short but as sweet.",
    "You made me believe in becoming a writer.",
    "The best audience I could ever have.",
    "I will have you in my filmmaking, surely.",
    "To be honest, I think learning languages would be a blast with you.",
    "Please, wait to see my films.",
    "I might teach you math sometimes.",
    "No one will ever be able to replace you bro. June is June (even tho I have two June's in my life, whatsoever.",
    "Oh, also wait to read my books too.",
    "Thank you for being you, June.",
    "Also thank you for being my friend. It is one of the best gift I could ever have.",
    "Happy birthday, June.",
    "Here is a song for you, one of my favorite EVER."
];

// Card suits and text-based numbers
const cardSuits = ['Heart', 'Diamond', 'Club', 'Spade'];
const cardNumbers = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'jack', 'queen'];

// Track used cards to prevent duplicates
let usedCards = new Set();

// Create all possible cards
function getAllPossibleCards() {
    const allCards = [];
    cardSuits.forEach(suit => {
        cardNumbers.forEach(number => {
            allCards.push({ suit, number });
        });
    });
    return allCards;
}

// Shuffle array using seeded random
function shuffleArray(array, seed) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Random number generator with seed
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Get current hour as seed
function getCurrentHourSeed() {
    const now = new Date();
    return now.getHours();
}

// Generate random card based on hour seed and message index (no duplicates)
function getRandomCard(messageIndex) {
    const hourSeed = getCurrentHourSeed();
    
    // Get all possible cards and shuffle them based on the hour seed
    const allCards = getAllPossibleCards();
    const shuffledCards = shuffleArray(allCards, hourSeed);
    
    // Use message index to select from shuffled deck (cycling if needed)
    const cardIndex = messageIndex % shuffledCards.length;
    const selectedCard = shuffledCards[cardIndex];
    
    return selectedCard;
}

// Create card overlay element
function createCardOverlay(card) {
    const overlay = document.createElement('div');
    overlay.className = 'card-overlay';
    overlay.innerHTML = `
        <div class="card-content">
            <div class="card-number">${card.number}</div>
            <div class="card-suit">
                <img src="assets/${card.suit}.png" alt="${card.suit}" class="suit-image">
            </div>
        </div>
    `;
    return overlay;
}

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
            messageText.textContent = realEndingMessages[currentMessageIndex];
            
            // Update previous message (above)
            if (currentMessageIndex > 0) {
                previousText.textContent = realEndingMessages[currentMessageIndex - 1];
            } else {
                previousText.textContent = '';
            }
            
            // Update next message (below)
            if (currentMessageIndex < realEndingMessages.length - 1) {
                nextText.textContent = realEndingMessages[currentMessageIndex + 1];
            } else {
                nextText.textContent = '';
            }
            
            // Show/hide left button
            if (currentMessageIndex > 0) {
                leftBtn.style.display = 'block';
            } else {
                leftBtn.style.display = 'none';
            }
            
            // Add card overlay after message 4 (index 3) - TESTING: show from message 1
            if (currentMessageIndex >= 0) {
                // Remove existing card overlay
                const existingOverlay = document.querySelector('.card-overlay');
                if (existingOverlay) {
                    existingOverlay.remove();
                }
                
                // Create and add new card overlay
                const card = getRandomCard(currentMessageIndex);
                console.log('Creating card:', card);
                const cardOverlay = createCardOverlay(card);
                document.body.appendChild(cardOverlay);
                console.log('Card overlay added to body');
                
                // Fade in the card overlay
                setTimeout(() => {
                    cardOverlay.style.opacity = '0.4';
                    console.log('Card opacity set to 0.4');
                }, 50);
            } else {
                // Remove card overlay for early messages
                const existingOverlay = document.querySelector('.card-overlay');
                if (existingOverlay) {
                    existingOverlay.remove();
                }
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
        if (currentMessageIndex < realEndingMessages.length - 1) {
            currentMessageIndex++;
            updateDisplay('forward');
        } else {
            // All messages shown, open the YouTube image link
            window.location.href = 'https://youtu.be/JGJPVl7iQUM';
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
    messageText.textContent = realEndingMessages[currentMessageIndex];
    if (realEndingMessages.length > 1) {
        nextText.textContent = realEndingMessages[1];
    }
    leftBtn.style.display = 'none';
    
    // Initialize card overlay if needed - TESTING: show from start
    if (currentMessageIndex >= 0) {
        const card = getRandomCard(currentMessageIndex);
        const cardOverlay = createCardOverlay(card);
        document.body.appendChild(cardOverlay);
        cardOverlay.style.opacity = '0.4';
    }
    
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
