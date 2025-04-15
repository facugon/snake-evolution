import 'phaser';
import Snake from './snake';
import Fruit from './fruit';
import MoleManager from './mole';
import Explosion from './explosion';
import { GameScene, CustomTextStyle } from './types';

// Agregar estilos para prevenir scrollbars
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';
document.documentElement.style.overflow = 'hidden';

class MainScene extends Phaser.Scene implements GameScene {
    // Game properties
    gridSize: number;
    private moveTime: number;
    
    // Game components
    private snake: Snake;
    private fruit: Fruit;
    private mole: MoleManager;
    private explosion: Explosion;
    
    // Input controls
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private spaceKey: Phaser.Input.Keyboard.Key;
    private shiftKey: Phaser.Input.Keyboard.Key;
    private xKey: Phaser.Input.Keyboard.Key;
    
    // Game state
    private score: number;
    private fruitsEaten: number;
    private isPaused: boolean;
    private gameEnded: boolean;
    
    // UI elements
    private scoreText: Phaser.GameObjects.Text;
    private fruitsEatenText: Phaser.GameObjects.Text;
    private pauseText: Phaser.GameObjects.Text;
    private gameOverText: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'MainScene' });
        
        // Game properties
        this.gridSize = 20;
        this.moveTime = 0;
        
        // Game components
        this.snake = null;
        this.fruit = null;
        this.mole = null;
        this.explosion = null;
        
        // Input controls
        this.cursors = null;
        this.spaceKey = null;
        this.shiftKey = null;
        this.xKey = null;
        
        // Game state
        this.score = 0;
        this.fruitsEaten = 0;
        this.isPaused = false;
        this.gameEnded = false;
    }

    preload(): void {
        // No need to preload anything for basic particles
    }

    create(): void {
        // Initialize game components
        this.snake = new Snake(this);
        this.fruit = new Fruit(this);
        this.mole = new MoleManager(this);
        this.explosion = new Explosion(this);
        
        // Spawn initial fruit
        this.fruit.spawn(this.snake.body, this.mole.moles, this.fruitsEaten);
        
        // Configure controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        
        // Add score text
        this.scoreText = this.add.text(16, 16, 'Score: 0', { 
            fontSize: '32px', 
            fill: '#fff' 
        } as CustomTextStyle);
        
        // Add fruits eaten text
        this.fruitsEatenText = this.add.text(16, 150, 'Fruits: 0', { 
            fontSize: '24px', 
            fill: '#fff' 
        } as CustomTextStyle);
        
        // Create pause text (initially invisible)
        this.pauseText = this.add.text(
            this.game.config.width as number / 2, 
            this.game.config.height as number / 2, 
            'PAUSA', 
            {
                fontSize: '64px',
                fill: '#fff'
            } as CustomTextStyle
        );
        this.pauseText.setOrigin(0.5);
        this.pauseText.visible = false;
        
        // Create game over text (initially invisible)
        this.gameOverText = this.add.text(
            this.game.config.width as number / 2, 
            this.game.config.height as number / 2, 
            'GAME OVER', 
            {
                fontSize: '64px',
                fill: '#ff0000'
            } as CustomTextStyle
        );
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.visible = false;
        
        // Initialize game state
        this.score = 0;
        this.fruitsEaten = 0;
        this.isPaused = false;
        this.gameEnded = false;
    }

    update(time: number): void {
        // Check if space key is pressed to pause/resume
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.isPaused = !this.isPaused;
            this.pauseText.visible = this.isPaused;
        }
        
        // If game is paused or ended, only update explosion if active
        if (this.isPaused || this.gameEnded) {
            if (this.explosion.isActive()) {
                const explosionEnded = this.explosion.update(time);
                if (explosionEnded && this.gameEnded) {
                    this.scene.restart();
                }
            }
            return;
        }
        
        // Update snake speed boost based on shift/X key
        if (this.shiftKey.isDown || this.xKey.isDown) {
            this.snake.setBoost(true);
        } else {
            this.snake.setBoost(false);
        }
        
        // Handle direction input
        if (this.cursors.left.isDown && this.snake.direction !== 'right') {
            this.snake.setDirection('left');
        } else if (this.cursors.right.isDown && this.snake.direction !== 'left') {
            this.snake.setDirection('right');
        } else if (this.cursors.up.isDown && this.snake.direction !== 'down') {
            this.snake.setDirection('up');
        } else if (this.cursors.down.isDown && this.snake.direction !== 'up') {
            this.snake.setDirection('down');
        }
        
        // Update visual components every frame
        this.snake.update();
        const fruitExpired = this.fruit.update(time);
        if (fruitExpired) {
            this.fruit.spawn(this.snake.body, this.mole.moles, this.fruitsEaten);
        }
        
        this.mole.update(time, this.snake.body);
        
        if (this.explosion.isActive()) {
            const explosionEnded = this.explosion.update(time);
            if (explosionEnded && this.gameEnded) {
                this.scene.restart();
            }
        }
        
        // Move snake at intervals
        if (time >= this.moveTime) {
            this.moveSnake();
            this.moveTime = time + this.snake.speed;
        }
    }
    
    moveSnake(): void {
        // Exit if game has ended
        if (this.gameEnded) return;
        
        // Apply next direction
        this.snake.applyDirection();
        
        // Calculate new head position
        const newHead = this.snake.move();
        
        // Check collision with walls
        if (this.snake.checkCollisionWithWalls(newHead.x, newHead.y)) {
            this.gameOver();
            return;
        }
        
        // Check collision with self
        if (this.snake.checkCollisionWithSelf(newHead.x, newHead.y)) {
            this.gameOver();
            return;
        }
        
        // Check collision with moles
        const moleCollision = this.mole.checkCollision(newHead.x, newHead.y);
        if (moleCollision.collision) {
            // Add new head to visualize collision
            this.snake.addSegment(newHead);
            
            // Create explosion at collision point
            this.explosion.create(moleCollision.position.x, moleCollision.position.y);
            this.gameOver();
            return;
        }
        
        // Add new head
        this.snake.addSegment(newHead);
        
        // Check collision with fruit
        if (this.fruit.checkCollision(newHead.x, newHead.y)) {
            // Increment fruit counter
            this.fruitsEaten += 1;
            this.fruitsEatenText.setText('Fruits: ' + this.fruitsEaten);
            
            // Spawn new fruit
            this.fruit.spawn(this.snake.body, this.mole.moles, this.fruitsEaten);
            
            // Increase score
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);
            
            // Increase snake speed
            this.snake.increaseSpeed();
        } else {
            // Remove tail if no fruit eaten
            this.snake.removeTail();
        }
    }
    
    gameOver(): void {
        this.gameEnded = true;
        this.gameOverText.visible = true;
        
        // If no explosion, restart after a short delay
        if (!this.explosion.isActive()) {
            this.time.delayedCall(1500, () => {
                this.scene.restart();
            });
        }
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game',
    backgroundColor: '#1a1a1a',
    scene: MainScene
};

const game = new Phaser.Game(config);

// Añadir evento para manejar cambios de tamaño de ventana
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
}); 