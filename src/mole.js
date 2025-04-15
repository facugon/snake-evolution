export default class Mole {
    constructor(scene) {
        this.scene = scene;
        this.gridSize = scene.gridSize;
        
        // Mole properties
        this.moles = []; // Array to store active moles
        this.maxMoles = 5; // Maximum simultaneous moles
        this.moleLifetime = 3000; // Mole lifetime (3 seconds)
        this.nextMoleTime = 0; // Time for next mole
        this.moleSpawnRate = 2000; // How often to try spawning a mole (2 seconds)
        this.moleSafeDistance = 5; // Safe distance from snake (in grid units)
        
        // Create graphics for moles
        this.graphics = scene.add.graphics({
            fillStyle: { color: 0x8B4513 } // Brown for moles
        });
        
        // Add mole counter text
        this.moleText = scene.add.text(16, 90, 'Moles: 0/5', {
            fontSize: '24px',
            fill: '#fff'
        });
    }
    
    update(time, snakeBody) {
        // Try to spawn new mole if we don't exceed maximum
        if (time >= this.nextMoleTime && this.moles.length < this.maxMoles) {
            this.spawnMole(snakeBody);
            this.nextMoleTime = time + this.moleSpawnRate;
        }
        
        // Update lifetimes of existing moles
        for (let i = this.moles.length - 1; i >= 0; i--) {
            const mole = this.moles[i];
            
            // If expired, remove mole
            if (time >= mole.expiryTime) {
                this.moles.splice(i, 1);
            }
        }
        
        // Redraw moles and update counter
        this.draw();
        this.moleText.setText(`Moles: ${this.moles.length}/${this.maxMoles}`);
    }
    
    spawnMole(snakeBody) {
        if (snakeBody.length === 0) return;
        
        const head = snakeBody[0];
        let x, y;
        let validPosition = false;
        let attempts = 0;
        
        // Try to find valid position (max 20 attempts)
        while (!validPosition && attempts < 20) {
            attempts++;
            
            // Select random distance between moleSafeDistance and moleSafeDistance+5
            const distance = Phaser.Math.Between(this.moleSafeDistance, this.moleSafeDistance + 5);
            
            // Select random angle (in radians)
            const angle = Phaser.Math.DegToRad(Phaser.Math.Between(0, 359));
            
            // Calculate position based on angle and distance
            x = head.x + Math.cos(angle) * distance * this.gridSize;
            y = head.y + Math.sin(angle) * distance * this.gridSize;
            
            // Adjust to grid
            x = Math.floor(x / this.gridSize) * this.gridSize;
            y = Math.floor(y / this.gridSize) * this.gridSize;
            
            // Check if within game bounds
            const gameWidth = this.scene.game.config.width;
            const gameHeight = this.scene.game.config.height;
            if (x < 0 || x >= gameWidth || y < 0 || y >= gameHeight) {
                continue;
            }
            
            // Check collision with snake
            validPosition = true;
            for (const segment of snakeBody) {
                if (x === segment.x && y === segment.y) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check collision with other moles
            if (validPosition) {
                for (const mole of this.moles) {
                    if (x === mole.position.x && y === mole.position.y) {
                        validPosition = false;
                        break;
                    }
                }
            }
        }
        
        // If valid position found, create mole
        if (validPosition) {
            this.moles.push({
                position: { x, y },
                expiryTime: this.scene.time.now + this.moleLifetime
            });
        }
    }
    
    draw() {
        // Clear previous graphics
        this.graphics.clear();
        
        // Draw each mole
        for (const mole of this.moles) {
            // Calculate remaining time as percentage
            const timeRemaining = Math.max(0, (mole.expiryTime - this.scene.time.now) / this.moleLifetime);
            
            // Extract RGB components of brown color (0x8B4513)
            const brownR = 0x8B;
            const brownG = 0x45;
            const brownB = 0x13;
            
            // Extract RGB components of red color (0xFF0000)
            const redR = 0xFF;
            const redG = 0x00;
            const redB = 0x00;
            
            // Interpolate components separately
            const r = Math.floor(brownR * timeRemaining + redR * (1 - timeRemaining));
            const g = Math.floor(brownG * timeRemaining + redG * (1 - timeRemaining));
            const b = Math.floor(brownB * timeRemaining + redB * (1 - timeRemaining));
            
            // Combine into color value
            const colorValue = (r << 16) | (g << 8) | b;
            
            this.graphics.fillStyle(colorValue, 1);
            
            // Draw mole as a circle
            const centerX = mole.position.x + this.gridSize / 2;
            const centerY = mole.position.y + this.gridSize / 2;
            const radius = this.gridSize / 2;
            
            this.graphics.fillCircle(centerX, centerY, radius);
        }
    }
    
    checkCollision(x, y) {
        for (const mole of this.moles) {
            if (x === mole.position.x && y === mole.position.y) {
                return { 
                    collision: true, 
                    position: { 
                        x: mole.position.x + this.gridSize / 2, 
                        y: mole.position.y + this.gridSize / 2 
                    }
                };
            }
        }
        return { collision: false };
    }
    
    destroy() {
        this.graphics.destroy();
        this.moleText.destroy();
    }
} 