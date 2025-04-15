import { GameScene, Position, Segment, CustomTextStyle, Mole } from './types';

export default class Fruit {
    private scene: GameScene;
    private gridSize: number;
    
    // Fruit properties
    private position: Position;
    private maxFoodLifetime: number;
    private minFoodLifetime: number;
    private foodMaxDistance: number;
    private lifetime: number;
    private expiryTime: number;
    private distanceToSnake: number;
    
    // Initial difficulty settings
    private initialMaxFoodLifetime: number;
    private initialMinFoodLifetime: number;
    private maxFruitsForFullDifficulty: number;
    
    // Visual elements
    private graphics: Phaser.GameObjects.Graphics;
    private foodText: Phaser.GameObjects.Text;
    
    constructor(scene: GameScene) {
        this.scene = scene;
        this.gridSize = scene.gridSize;
        
        // Fruit properties
        this.position = { x: 0, y: 0 };
        this.maxFoodLifetime = 5000; // Max lifetime (5 seconds)
        this.minFoodLifetime = 1500; // Min lifetime (1.5 seconds)
        this.foodMaxDistance = 20; // Max distance for calculation (grid units)
        this.lifetime = 0;
        this.expiryTime = 0;
        this.distanceToSnake = 0;
        
        // Initial difficulty settings
        this.initialMaxFoodLifetime = 10000; // Initial max (10 seconds)
        this.initialMinFoodLifetime = 5000; // Initial min (5 seconds)
        this.maxFruitsForFullDifficulty = 20; // Fruits needed for max difficulty
        
        // Create graphics for the fruit
        this.graphics = scene.add.graphics({
            fillStyle: { color: 0xff0000 } // Red for the fruit
        });
        
        // Add food timer text
        this.foodText = scene.add.text(16, 120, 'Food Time: 100%', { 
            fontSize: '24px', 
            fill: '#fff' 
        } as CustomTextStyle);
    }
    
    spawn(snakeBody: Segment[], moles: Mole[], fruitsEaten: number): void {
        // Find valid position for food
        let x: number, y: number;
        let valid = false;
        
        while (!valid) {
            const gameWidth = this.scene.game.config.width as number;
            const gameHeight = this.scene.game.config.height as number;
            const gridWidth = Math.floor(gameWidth / this.gridSize);
            const gridHeight = Math.floor(gameHeight / this.gridSize);
            
            x = Math.floor(Math.random() * gridWidth) * this.gridSize;
            y = Math.floor(Math.random() * gridHeight) * this.gridSize;
            
            // Check collision with snake
            valid = true;
            for (const segment of snakeBody) {
                if (x === segment.x && y === segment.y) {
                    valid = false;
                    break;
                }
            }
            
            // Check collision with moles
            if (valid && moles) {
                for (const mole of moles) {
                    if (x === mole.position.x && y === mole.position.y) {
                        valid = false;
                        break;
                    }
                }
            }
        }
        
        // Calculate distance to snake head
        const head = snakeBody[0];
        const dx = Math.abs(x - head.x) / this.gridSize;
        const dy = Math.abs(y - head.y) / this.gridSize;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate difficulty factor (0 to 1)
        const difficultyFactor = Math.min(fruitsEaten / this.maxFruitsForFullDifficulty, 1);
        
        // Interpolate min and max lifetimes based on difficulty
        const currentMinLifetime = this.initialMinFoodLifetime - 
            difficultyFactor * (this.initialMinFoodLifetime - this.minFoodLifetime);
        const currentMaxLifetime = this.initialMaxFoodLifetime - 
            difficultyFactor * (this.initialMaxFoodLifetime - this.maxFoodLifetime);
        
        // Calculate lifetime based on distance
        // The further, the more time
        const normalizedDistance = Math.min(distance, this.foodMaxDistance) / this.foodMaxDistance;
        const lifetime = currentMinLifetime + normalizedDistance * (currentMaxLifetime - currentMinLifetime);
        
        // Set fruit properties
        this.position = { x, y };
        this.lifetime = lifetime;
        this.expiryTime = this.scene.time.now + lifetime;
        this.distanceToSnake = distance;
    }
    
    update(time: number): boolean {
        // Update food time text
        const timeRemaining = Math.max(0, (this.expiryTime - time) / this.lifetime * 100);
        this.foodText.setText(`Food Time: ${Math.floor(timeRemaining)}%`);
        
        // Draw the fruit
        this.draw(time);
        
        // Check if expired
        return time >= this.expiryTime;
    }
    
    draw(time: number): void {
        // Clear previous graphics
        this.graphics.clear();
        
        // Calculate remaining time as percentage
        const timeRemaining = Math.max(0, (this.expiryTime - time) / this.lifetime);
        
        // Change color based on remaining time
        // Red -> Orange -> Yellow as time depletes
        const redR = 0xFF;
        const redG = 0x00;
        const redB = 0x00;
        
        const yellowR = 0xFF;
        const yellowG = 0xFF;
        const yellowB = 0x00;
        
        // Interpolate components
        const r = Math.floor(redR);
        const g = Math.floor(redG * (1 - timeRemaining) + yellowG * timeRemaining);
        const b = Math.floor(redB * (1 - timeRemaining) + yellowB * timeRemaining);
        
        // Combine into color value
        const colorValue = (r << 16) | (g << 8) | b;
        
        this.graphics.fillStyle(colorValue, 1);
        
        // Draw the fruit
        this.graphics.fillRect(this.position.x, this.position.y, this.gridSize, this.gridSize);
        
        // Draw time indicator (shrinking circle)
        const centerX = this.position.x + this.gridSize / 2;
        const centerY = this.position.y + this.gridSize / 2;
        const maxRadius = this.gridSize * 0.9;
        const currentRadius = maxRadius * timeRemaining;
        
        this.graphics.lineStyle(2, 0xFFFFFF, 0.5);
        this.graphics.strokeCircle(centerX, centerY, currentRadius);
    }
    
    checkCollision(x: number, y: number): boolean {
        return (x === this.position.x && y === this.position.y);
    }
    
    destroy(): void {
        this.graphics.destroy();
        this.foodText.destroy();
    }
} 