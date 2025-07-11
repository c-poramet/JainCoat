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
            offset: 0
        };
        
        this.screenWidth = window.innerWidth;
        this.isMoving = { left: false, right: false };
        this.nearObject = null;
        
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
        rightBtn.addEventListener('mousedown', () => this.isMoving.right = true);
        rightBtn.addEventListener('mouseup', () => this.isMoving.right = false);
        
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
                }
                foundNearObject = true;
            }
        });
        
        if (!foundNearObject && this.nearObject) {
            this.nearObject = null;
            this.hideInteractButton();
        }
    }
    
    interact() {
        if (this.nearObject) {
            const message = this.nearObject.dataset.message;
            if (message) {
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
        const messageDisplay = document.getElementById('message-display');
        const messageContent = document.getElementById('message-content');
        
        messageContent.textContent = message;
        messageDisplay.classList.remove('hidden');
    }
    
    hideMessage() {
        const messageDisplay = document.getElementById('message-display');
        messageDisplay.classList.add('hidden');
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
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.juneGame = new JuneGame();
});

// Prevent scrolling on mobile
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });
