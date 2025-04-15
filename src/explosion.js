export default class Explosion {
    constructor(scene) {
        this.scene = scene;
        
        // Explosion properties
        this.particles = [];
        this.duration = 1000; // Explosion duration in ms
        this.active = false;
        this.startTime = 0;
        
        // Create graphics for explosion particles
        this.graphics = scene.add.graphics();
    }
    
    create(x, y) {
        this.active = true;
        this.startTime = this.scene.time.now;
        this.particles = [];
        
        // Create many particles in all directions
        const particleCount = 50; // Number of particles
        
        for (let i = 0; i < particleCount; i++) {
            // Random angle for each particle (360 degrees)
            const angle = Phaser.Math.DegToRad(Phaser.Math.Between(0, 359));
            
            // Random speed for the particle
            const speed = Phaser.Math.Between(100, 300);
            
            // Calculate velocity in x and y components
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            // Explosion colors (red, orange, yellow tones)
            const colors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0xFF5500];
            const color = colors[Phaser.Math.Between(0, colors.length - 1)];
            
            // Create particle
            this.particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                life: 1.0, // Max life
                lifeSpeed: Phaser.Math.FloatBetween(0.01, 0.03), // Decay rate
                size: Phaser.Math.Between(3, 8), // Particle size
                color: color
            });
        }
    }
    
    update(time) {
        // Check if explosion has ended
        if (time > this.startTime + this.duration) {
            this.active = false;
            this.particles = [];
            this.graphics.clear();
            return true; // Explosion ended
        }
        
        // Clear previous graphics
        this.graphics.clear();
        
        // Update each particle
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Update position
            p.x += p.vx * (1/60); // Assuming 60 FPS
            p.y += p.vy * (1/60);
            
            // Reduce life
            p.life -= p.lifeSpeed;
            
            // If life <= 0, remove particle
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Draw particle
            const alpha = p.life; // Transparency based on life
            const size = p.size * p.life; // Size decreases with life
            
            // Set fill style
            this.graphics.fillStyle(p.color, alpha);
            
            // Draw particle as circle
            this.graphics.fillCircle(p.x, p.y, size);
        }
        
        return false; // Explosion still active
    }
    
    isActive() {
        return this.active;
    }
    
    destroy() {
        this.graphics.destroy();
    }
} 