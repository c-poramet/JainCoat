// June's Adventure Game

class JuneGame {
    constructor() {
        this.player = {
            x: 100,
            worldX: 100, // Actual world position
            element: document.getElementById('player'),
            sprite: document.getElementById('player-sprite'),
            width: 120,
            speed: 5,
            currentStateIndex: 0,
            states: [
                { name: 'default', src: 'assets/June.png' },
                { name: 'no-umbrella', src: 'assets/June with no umbrella .png' },
                { name: 'smile', src: 'assets/June Smile.png' },
                { name: 'sad', src: 'assets/June Sad.png' },
                { name: 'grumpy', src: 'assets/June Grumpy .png' }
            ]
        };
        
        this.camera = {
            x: 0, // Camera offset
            followThreshold: 200 // How close to edge before camera follows
        };
        
        this.background = {
            element: document.getElementById('background'),
            skyElement: document.getElementById('sky-background'),
            offset: 0
        };
        
        this.screenWidth = window.innerWidth;
        this.isMoving = { left: false, right: false };
        this.nearObject = null;
        this.lastInteractedObject = null; // Track the last object June interacted with
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Mobile Controls
        const leftBtn = document.getElementById('left-btn');
        const rightBtn = document.getElementById('right-btn');
        const umbrellaBtn = document.getElementById('umbrella-btn');
        const interactBtn = document.getElementById('interact-btn');
        
        // Movement controls
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isMoving.left = true;
        });
        
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isMoving.left = false;
        });
        
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isMoving.right = true;
        });
        
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isMoving.right = false;
        });
        
        // Also support mouse for testing
        leftBtn.addEventListener('mousedown', () => this.isMoving.left = true);
        leftBtn.addEventListener('mouseup', () => this.isMoving.left = false);
        leftBtn.addEventListener('mouseleave', () => this.isMoving.left = false); // Stop when mouse leaves button
        
        rightBtn.addEventListener('mousedown', () => this.isMoving.right = true);
        rightBtn.addEventListener('mouseup', () => this.isMoving.right = false);
        rightBtn.addEventListener('mouseleave', () => this.isMoving.right = false); // Stop when mouse leaves button
        
        // Add touchcancel events to handle interrupted touches
        leftBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.isMoving.left = false;
        });
        
        rightBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.isMoving.right = false;
        });
        
        // Umbrella toggle
        umbrellaBtn.addEventListener('click', () => this.toggleUmbrella());
        
        // Interact button
        interactBtn.addEventListener('click', () => this.interact());
        
        // Keyboard controls (for desktop testing)
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.isMoving.left = true;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.isMoving.right = true;
                    break;
                case 'Space':
                    e.preventDefault();
                    this.interact();
                    break;
                case 'KeyU':
                    this.toggleUmbrella();
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'ArrowLeft':
                    this.isMoving.left = false;
                    break;
                case 'ArrowRight':
                    this.isMoving.right = false;
                    break;
            }
        });
        
        // Message close (tap anywhere on message)
        document.getElementById('message-display').addEventListener('click', () => {
            this.hideMessage();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.screenWidth = window.innerWidth;
        });
        
        // Stop movement when window loses focus or visibility changes
        window.addEventListener('blur', () => {
            this.stopMovement();
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopMovement();
            }
        });
    }
    
    gameLoop() {
        this.updatePlayer();
        this.checkInteractions();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updatePlayer() {
        // Movement with boundaries
        if (this.isMoving.left && this.player.worldX > 0) {
            this.player.worldX -= this.player.speed;
            this.flipPlayer(true);
        }
        if (this.isMoving.right) {
            this.player.worldX += this.player.speed;
            this.flipPlayer(false);
        }
        
        // Prevent going past the left boundary (invisible wall at start)
        this.player.worldX = Math.max(0, this.player.worldX);
        
        // Update camera and player screen position
        this.updateCamera();
        
        // Apply position
        this.player.element.style.left = this.player.x + 'px';
    }
    
    flipPlayer(facingLeft) {
        if (facingLeft) {
            this.player.sprite.style.transform = 'scaleX(-1)';
        } else {
            this.player.sprite.style.transform = 'scaleX(1)';
        }
    }
    
    updateCamera() {
        // Calculate where June should appear on screen relative to camera
        this.player.x = this.player.worldX - this.camera.x;
        
        // Check if we need to move camera when June goes too far right
        if (this.player.x > this.screenWidth - this.camera.followThreshold) {
            // Move camera to keep June in view
            this.camera.x = this.player.worldX - (this.screenWidth - this.camera.followThreshold);
        }
        
        // Check if we need to move camera when June goes too far left
        if (this.player.x < this.camera.followThreshold && this.camera.x > 0) {
            // Move camera to keep June in view
            this.camera.x = Math.max(0, this.player.worldX - this.camera.followThreshold);
        }
        
        // Prevent camera from going negative (don't scroll past the start)
        this.camera.x = Math.max(0, this.camera.x);
        
        // Update player screen position based on camera
        this.player.x = this.player.worldX - this.camera.x;
        
        // Update background position based on camera
        this.background.element.style.backgroundPositionX = -this.camera.x + 'px';
        
        // Update sky background position (scroll slower for parallax effect)
        this.background.skyElement.style.backgroundPositionX = -this.camera.x * 0.5 + 'px';
        
        // Update all objects' positions based on camera
        this.updateObjectPositions();
    }
    
    updateObjectPositions() {
        const objects = document.querySelectorAll('.interactive-object');
        objects.forEach(obj => {
            const worldX = parseInt(obj.dataset.worldX) || 0;
            const screenX = worldX - this.camera.x;
            obj.style.left = screenX + 'px';
        });
    }
    
    toggleUmbrella() {
        // Cycle to the next character state
        this.player.currentStateIndex = (this.player.currentStateIndex + 1) % this.player.states.length;
        
        // Update the sprite to the new state
        const currentState = this.player.states[this.player.currentStateIndex];
        this.player.sprite.src = currentState.src;
        
        console.log(`June is now in state: ${currentState.name}`);
    }
    
    checkInteractions() {
        const objects = document.querySelectorAll('.interactive-object');
        const playerRect = this.getPlayerRect();
        let foundNearObject = false;
        
        objects.forEach(obj => {
            const worldX = parseInt(obj.dataset.worldX) || 0;
            const objRect = {
                left: worldX,
                right: worldX + 60, // Object width
                top: window.innerHeight - 200,
                bottom: window.innerHeight - 140
            };
            
            if (this.isNear(playerRect, objRect)) {
                if (this.nearObject !== obj) {
                    this.nearObject = obj;
                    this.showInteractButton();
                    
                    // Hide quarter message if showing when approaching an object
                    const messageDisplay = document.getElementById('message-display');
                    if (messageDisplay.classList.contains('quarter')) {
                        this.hideQuarterMessage();
                    }
                }
                foundNearObject = true;
            }
        });
        
        if (!foundNearObject && this.nearObject) {
            this.nearObject = null;
            this.hideInteractButton();
            
            // If there's a last interacted object and no message is showing, show quarter-sized "..."
            if (this.lastInteractedObject && document.getElementById('message-display').classList.contains('hidden')) {
                this.showQuarterMessage();
            }
            
            // Scale buttons back up when walking away from objects
            if (document.getElementById('message-display').classList.contains('hidden')) {
                this.scaleButtonsUp();
            }
        }
    }
    
    interact() {
        if (this.nearObject) {
            const message = this.nearObject.dataset.message;
            if (message) {
                this.lastInteractedObject = this.nearObject; // Track this interaction
                this.showMessage(message);
            }
        }
    }
    
    showInteractButton() {
        const interactBtn = document.getElementById('interact-btn');
        interactBtn.classList.remove('hidden');
    }
    
    hideInteractButton() {
        const interactBtn = document.getElementById('interact-btn');
        interactBtn.classList.add('hidden');
    }
     showMessage(message) {
        // Stop all movement when showing a message
        this.stopMovement();
        
        // Scale down buttons to make room for text box
        this.scaleButtonsDown();
        
        const messageDisplay = document.getElementById('message-display');
        const messageContent = document.getElementById('message-content');
        
        // Remove quarter class if it exists
        messageDisplay.classList.remove('quarter');
        
        messageContent.textContent = message;
        messageDisplay.classList.remove('hidden');
    }

    hideMessage() {
        const messageDisplay = document.getElementById('message-display');
        
        // If user clicked to close full message and there's a last interacted object, show quarter
        if (this.lastInteractedObject && !messageDisplay.classList.contains('quarter')) {
            this.showQuarterMessage();
        } else {
            // Completely hide the message
            messageDisplay.classList.add('hidden');
            messageDisplay.classList.remove('quarter');
            // Scale buttons back up when message is hidden
            this.scaleButtonsUp();
        }
    }
    
    showQuarterMessage() {
        const messageDisplay = document.getElementById('message-display');
        const messageContent = document.getElementById('message-content');
        
        messageContent.textContent = '...';
        messageDisplay.classList.remove('hidden');
        messageDisplay.classList.add('quarter');
        
        // Scale buttons back up since this is just a small indicator
        this.scaleButtonsUp();
    }
    
    hideQuarterMessage() {
        const messageDisplay = document.getElementById('message-display');
        messageDisplay.classList.add('hidden');
        messageDisplay.classList.remove('quarter');
    }
    
    scaleButtonsDown() {
        const buttons = document.querySelectorAll('.control-btn');
        buttons.forEach(btn => {
            btn.classList.add('small');
        });
    }
    
    scaleButtonsUp() {
        const buttons = document.querySelectorAll('.control-btn');
        buttons.forEach(btn => {
            btn.classList.remove('small');
        });
    }
    
    getPlayerRect() {
        return {
            left: this.player.worldX,
            right: this.player.worldX + this.player.width,
            top: window.innerHeight - 200, // Approximate player top
            bottom: window.innerHeight - 80, // Approximate player bottom
            width: this.player.width,
            height: 120
        };
    }
    
    // Helper method to add interactive objects to the world
    addObject(worldX, imageSrc, message, id) {
        const objectsContainer = document.getElementById('objects-container');
        const obj = document.createElement('div');
        obj.className = 'interactive-object';
        obj.id = id;
        obj.dataset.worldX = worldX;
        obj.dataset.message = message;
        obj.style.bottom = '140px'; // Position above ground
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = message;
        
        obj.appendChild(img);
        objectsContainer.appendChild(obj);
        
        // Initial positioning
        this.updateObjectPositions();
        
        return obj;
    }
    
    isNear(rect1, rect2) {
        const distance = 100; // How close player needs to be
        
        return !(rect1.right < rect2.left - distance || 
                rect1.left > rect2.right + distance || 
                rect1.bottom < rect2.top - distance || 
                rect1.top > rect2.bottom + distance);
    }
    
    stopMovement() {
        this.isMoving.left = false;
        this.isMoving.right = false;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.juneGame = new JuneGame();
    
    // Add interactive objects after game is initialized
    setTimeout(() => {
        // Add the sun below the sky, far to the right
        window.juneGame.addObject(
            2600, // worldX position (600 + 2000px further right)
            'assets/Sun.png',
            'Hello sunshine! ☀️ I wished to be a sun. I am the light of the world, but I am also the reason for global warming.',
            'sun-object'
        );
        
        // Position the sun higher up (below the sky)
        const sunObject = document.getElementById('sun-object');
        if (sunObject) {
            sunObject.style.bottom = '60%'; // Position it in the sky area
            sunObject.style.width = '200px';  // Make it a bit larger since it's in the sky
            sunObject.style.height = '200px';
        }
        
        // Add the cat 500px to the right of the sun, at ground level
        window.juneGame.addObject(
            3100, // worldX position (2600 + 500px further right)
            'assets/Cat.png',
            'Meow! 🐱 I wished to be a cat. Unbothered to taxes and schools, but you know pain is inevitable.',
            'cat-object'
        );
        
        // Keep the cat at ground level (same height as June)
        const catObject = document.getElementById('cat-object');
        if (catObject) {
            catObject.style.bottom = '140px'; // Same level as June
            catObject.style.width = '100px';   // Appropriate size for a cat
            catObject.style.height = '100px';
        }
        
        // Add flowers 250px away from the cat, at ground level
        window.juneGame.addObject(
            3550, // worldX position (3100 + 250px further right)
            'assets/Flowers 1.png',
            'Beautiful flowers! 🌸 I wished to be flowers. Pretty and colorful, but my beauty fades with time.',
            'flowers-object'
        );
        
        // Keep the flowers at ground level (same height as June)
        const flowersObject = document.getElementById('flowers-object');
        if (flowersObject) {
            flowersObject.style.bottom = '140px'; // Same level as June
            flowersObject.style.width = '80px';    // Appropriate size for flowers
            flowersObject.style.height = '80px';
        }
        
        // Add second flowers 200px after the first flowers, at ground level
        window.juneGame.addObject(
            4150, // worldX position (3350 + 200px further right)
            'assets/Flowers 2.png',
            'More beautiful flowers! 🌺 I wished to be flowers too. Different colors, same fate - beauty is fleeting.',
            'flowers2-object'
        );
        
        // Keep the second flowers at ground level (same height as June)
        const flowers2Object = document.getElementById('flowers2-object');
        if (flowers2Object) {
            flowers2Object.style.bottom = '140px'; // Same level as June
            flowers2Object.style.width = '80px';    // Appropriate size for flowers
            flowers2Object.style.height = '80px';
        }
        
        // Add piano 300px after the second flowers, at ground level
        window.juneGame.addObject(
            5250, // worldX position (4150 + 300px further right)
            'assets/Piano.png',
            'A piano! 🎹 I wished to be a piano. People love my creations but hate the journey it takes to learn how to make them.',
            'piano-object'
        );
        
        // Keep the piano at ground level (same height as June)
        const pianoObject = document.getElementById('piano-object');
        if (pianoObject) {
            pianoObject.style.bottom = '50px'; // Same level as June
            pianoObject.style.width = '120px';   // Larger size for a piano
            pianoObject.style.height = '120px';
        }
        
        // Add bouquet 420px after the piano, at ground level
        window.juneGame.addObject(
            4870, // worldX position (4450 + 420px further right)
            'assets/Bouquet .png',
            'A lovely bouquet! 💐 I wished to be a bouquet. Given with love and joy, but destined to wither and be forgotten.',
            'bouquet-object'
        );
        
        // Keep the bouquet at ground level (same height as June)
        const bouquetObject = document.getElementById('bouquet-object');
        if (bouquetObject) {
            bouquetObject.style.bottom = '140px'; // Same level as June
            bouquetObject.style.width = '90px';    // Appropriate size for a bouquet
            bouquetObject.style.height = '90px';
        }
        
        // Add gift box 300px after the bouquet, at ground level
        window.juneGame.addObject(
            5670, // worldX position (4870 + 300px further right)
            'assets/Gift.png',
            'A mysterious gift box! 🎁 I wished to be a gift. Wrapped with care and anticipation, but my value is only known when opened.',
            'gift-object'
        );
        
        // Keep the gift box at ground level (same height as June)
        const giftObject = document.getElementById('gift-object');
        if (giftObject) {
            giftObject.style.bottom = '140px'; // Same level as June
            giftObject.style.width = '85px';    // Appropriate size for a gift box
            giftObject.style.height = '85px';
        }
    }, 100); // Small delay to ensure game is fully loaded
});

// Prevent scrolling on mobile
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });
