import { GameScene, Segment, Particle, CustomTextStyle } from './types';

export default class Snake {
    private scene: GameScene;
    private gridSize: number;
    direction: string;
    private nextDirection: string;
    private speedBoostActive: boolean;
    private baseSpeed: number;
    speed: number;
    
    body: Segment[];
    private visualBody: Segment[];
    private graphics: Phaser.GameObjects.Graphics;
    private trailGraphics: Phaser.GameObjects.Graphics;
    private particles: Particle[];
    private boostText: Phaser.GameObjects.Text;
    
    constructor(scene: GameScene) {
        this.scene = scene;
        this.gridSize = scene.gridSize;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.speedBoostActive = false;
        this.baseSpeed = 200;
        this.speed = 200;
        
        // Initialize snake body
        this.body = [
            { x: 400, y: 300 },
            { x: 380, y: 300 },
            { x: 360, y: 300 }
        ];
        
        // Visual positions (for smooth movement)
        this.visualBody = [];
        for (let segment of this.body) {
            this.visualBody.push({
                x: segment.x,
                y: segment.y
            });
        }
        
        // Create graphics for the snake body
        this.graphics = scene.add.graphics({
            fillStyle: { color: 0x00ff00 } // Green for the snake
        });
        
        // Trail particles
        this.particles = [];
        this.trailGraphics = scene.add.graphics();
        
        // Add boost text to the scene
        this.boostText = scene.add.text(16, 60, 'BOOST: OFF', { 
            fontSize: '24px', 
            fill: '#888' 
        } as CustomTextStyle);
    }
    
    update(): void {
        this.updateVisualPositions();
        this.draw();
        this.updateParticles();
    }
    
    updateVisualPositions(): void {
        // Smoothly update the visual positions towards the logical positions
        const smoothFactor = 0.4; // Ajustado para mejor equilibrio entre fluidez y precisión
        
        for (let i = 0; i < this.body.length; i++) {
            if (i >= this.visualBody.length) {
                // Add visual segment if needed
                this.visualBody.push({
                    x: this.body[i].x,
                    y: this.body[i].y
                });
            } else {
                // Move visual position toward actual position
                this.visualBody[i].x += (this.body[i].x - this.visualBody[i].x) * smoothFactor;
                this.visualBody[i].y += (this.body[i].y - this.visualBody[i].y) * smoothFactor;
            }
        }
        
        // Remove excess visual segments
        while (this.visualBody.length > this.body.length) {
            this.visualBody.pop();
        }
    }
    
    move(): Segment {
        // Calculate new position of the head
        let x = this.body[0].x;
        let y = this.body[0].y;
        
        if (this.direction === 'left') {
            x -= this.gridSize;
        } else if (this.direction === 'right') {
            x += this.gridSize;
        } else if (this.direction === 'up') {
            y -= this.gridSize;
        } else if (this.direction === 'down') {
            y += this.gridSize;
        }
        
        // Return the new head position without adding it yet
        return { x, y };
    }
    
    addSegment(position: Segment): void {
        this.body.unshift(position);
        // Add new visual segment at the same position
        this.visualBody.unshift({
            x: position.x,
            y: position.y
        });
    }
    
    removeTail(): Segment {
        // Remove from both arrays
        this.visualBody.pop();
        return this.body.pop();
    }
    
    setDirection(direction: string): void {
        // Solo permitir cambios de dirección válidos - evita giros de 180 grados
        if (
            (direction === 'left' && this.direction !== 'right') ||
            (direction === 'right' && this.direction !== 'left') ||
            (direction === 'up' && this.direction !== 'down') ||
            (direction === 'down' && this.direction !== 'up')
        ) {
            this.nextDirection = direction;
        }
    }
    
    applyDirection(): void {
        this.direction = this.nextDirection;
    }
    
    checkCollisionWithSelf(x: number, y: number): boolean {
        // Verificar usando posiciones lógicas exactas, no visuales
        for (let i = 0; i < this.body.length; i++) {
            if (x === this.body[i].x && y === this.body[i].y) {
                return true;
            }
        }
        return false;
    }
    
    checkCollisionWithWalls(x: number, y: number): boolean {
        const gameWidth = this.scene.game.config.width as number;
        const gameHeight = this.scene.game.config.height as number;
        return (x < 0 || x >= gameWidth || y < 0 || y >= gameHeight);
    }
    
    setBoost(active: boolean): void {
        this.speedBoostActive = active;
        if (active) {
            this.speed = Math.floor(this.baseSpeed / 3); // 3 times faster
            this.boostText.setText('BOOST: ON');
            this.boostText.setFill('#ff0'); // Yellow
            
            // Create trail particles if moving
            if (this.body.length > 0) {
                this.createTrailParticles();
            }
        } else {
            this.speed = this.baseSpeed;
            this.boostText.setText('BOOST: OFF');
            this.boostText.setFill('#888'); // Gray
        }
    }
    
    increaseSpeed(): void {
        if (this.baseSpeed > 50) {
            this.baseSpeed -= 5;
            // Apply current boost state
            this.speed = this.speedBoostActive ? Math.floor(this.baseSpeed / 3) : this.baseSpeed;
        }
    }
    
    draw(): void {
        // Clear previous graphics
        this.graphics.clear();
        
        // Draw each segment based on visual positions for smooth appearance
        for (let i = 0; i < this.visualBody.length; i++) {
            const segment = this.visualBody[i];
            this.graphics.fillRect(segment.x, segment.y, this.gridSize, this.gridSize);
        }
    }
    
    createTrailParticles(): void {
        if (this.body.length <= 1) return;
        
        const tailSegment = this.body[this.body.length - 1];
        const prevSegment = this.body[this.body.length - 2];
        
        // Determine direction for particles
        let particleAngle = 0;
        
        // Calculate direction based on the difference between segments
        if (tailSegment.x < prevSegment.x) {
            particleAngle = 0; // Emit to the right
        } else if (tailSegment.x > prevSegment.x) {
            particleAngle = 180; // Emit to the left
        } else if (tailSegment.y < prevSegment.y) {
            particleAngle = 90; // Emit down
        } else if (tailSegment.y > prevSegment.y) {
            particleAngle = 270; // Emit up
        }
        
        // Create particles
        this.createParticles(
            tailSegment.x + this.gridSize / 2,
            tailSegment.y + this.gridSize / 2,
            particleAngle
        );
    }
    
    createParticles(x: number, y: number, angle: number): void {
        // Create 3-6 particles each time
        const count = Phaser.Math.Between(3, 6);
        
        for (let i = 0; i < count; i++) {
            // Calculate random angle within range
            const particleAngle = Phaser.Math.DegToRad(
                angle + Phaser.Math.Between(-30, 30)
            );
            
            // Random speed
            const speed = Phaser.Math.Between(20, 80);
            
            // Velocity components
            const vx = Math.cos(particleAngle) * speed;
            const vy = Math.sin(particleAngle) * speed;
            
            // Random color from greenish/blueish tones
            const colors = [0x00ff88, 0x00ffaa, 0x00ddff];
            const color = colors[Phaser.Math.Between(0, colors.length - 1)];
            
            // Create particle with physics properties
            this.particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                life: 1.0, // Max life (will decrease)
                lifeSpeed: Phaser.Math.FloatBetween(0.01, 0.03), // Decay rate
                size: Phaser.Math.Between(4, 8), // Initial size
                color: color
            });
        }
    }
    
    updateParticles(): void {
        // Clear graphics before redrawing
        this.trailGraphics.clear();
        
        // Update each particle
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Update position
            p.x += p.vx * (1/60); // Assuming 60 FPS
            p.y += p.vy * (1/60);
            
            // Reduce life
            p.life -= p.lifeSpeed;
            
            // Remove if life <= 0
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Draw particle
            const alpha = p.life; // Transparency based on life
            const size = p.size * p.life; // Size decreases with life
            
            // Set fill style
            this.trailGraphics.fillStyle(p.color, alpha);
            
            // Draw particle as circle
            this.trailGraphics.fillCircle(p.x, p.y, size);
        }
    }
    
    getHead(): Segment {
        return this.body[0];
    }
    
    destroy(): void {
        this.graphics.destroy();
        this.trailGraphics.destroy();
        this.boostText.destroy();
    }
} 