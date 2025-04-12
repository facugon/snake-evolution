import 'phaser';

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.snake = null;
        this.food = null;
        this.cursors = null;
        this.speed = 200;
        this.baseSpeed = 200; // Velocidad base para referencia
        this.moveTime = 0;
        this.snakeBody = [];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.gridSize = 20;
        this.speedBoostActive = false; // Estado del boost de velocidad
        this.trailParticles = null; // Sistema de partículas para la estela
    }

    preload() {
        // No es necesario precargar nada para las partículas básicas
    }

    create() {
        // Crear gráfico para el cuerpo de la serpiente
        this.snakeBodyGraphics = this.add.graphics({
            fillStyle: { color: 0x00ff00 } // Verde brillante para la serpiente
        });
        
        // Crear gráfico para la comida
        this.foodGraphics = this.add.graphics({
            fillStyle: { color: 0xff0000 } // Rojo para la comida
        });
        
        // Inicializar la serpiente
        this.snake = { x: 400, y: 300 };
        this.snakeBody = [
            { x: 400, y: 300 },
            { x: 380, y: 300 },
            { x: 360, y: 300 }
        ];
        
        // Inicializar la comida
        this.food = { x: 300, y: 300 };
        
        // Dibujar serpiente y comida iniciales
        this.drawSnake();
        this.drawFood();
        
        // Configurar controles
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Añadir control de pausa con la barra espaciadora
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Añadir teclas para el boost de velocidad
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        
        // Añadir texto de puntuación (solo una vez)
        this.scoreText = this.add.text(16, 16, 'Score: 0', { 
            fontSize: '32px', 
            fill: '#fff' 
        });
        
        // Crear texto de pausa (inicialmente invisible)
        this.pauseText = this.add.text(400, 300, 'PAUSA', {
            fontSize: '64px',
            fill: '#fff'
        });
        this.pauseText.setOrigin(0.5);
        this.pauseText.visible = false;
        
        // Crear texto para indicador de boost
        this.boostText = this.add.text(16, 60, 'BOOST: OFF', { 
            fontSize: '24px', 
            fill: '#ff0' 
        });
        
        // Gráfico para las partículas
        this.trailGraphics = this.add.graphics();
        
        // Arreglo para almacenar las partículas manuales
        this.particles = [];
        
        this.score = 0;
        this.isPaused = false;
    }

    update(time) {
        // Comprobar si se ha pulsado la barra espaciadora para pausar/reanudar
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.isPaused = !this.isPaused;
            this.pauseText.visible = this.isPaused;
        }
        
        // Si el juego está pausado, no actualizar
        if (this.isPaused) {
            return;
        }
        
        // Actualizar partículas existentes
        this.updateParticles();
        
        // Controlar velocidad con SHIFT o X
        if (this.shiftKey.isDown || this.xKey.isDown) {
            this.speed = Math.floor(this.baseSpeed / 3); // 3 veces más rápido
            this.speedBoostActive = true;
            this.boostText.setText('BOOST: ON');
            this.boostText.setFill('#ff0'); // Amarillo
            
            // Crear partículas en la cola si la serpiente se está moviendo
            if (this.snakeBody.length > 0) {
                const tailSegment = this.snakeBody[this.snakeBody.length - 1];
                
                // Determinar dirección para las partículas
                let particleAngle = 0;
                if (this.snakeBody.length > 1) {
                    const prevSegment = this.snakeBody[this.snakeBody.length - 2];
                    
                    // Calcular dirección basada en la diferencia entre segmentos
                    if (tailSegment.x < prevSegment.x) {
                        particleAngle = 0; // Emitir hacia la derecha
                    } else if (tailSegment.x > prevSegment.x) {
                        particleAngle = 180; // Emitir hacia la izquierda
                    } else if (tailSegment.y < prevSegment.y) {
                        particleAngle = 90; // Emitir hacia abajo
                    } else if (tailSegment.y > prevSegment.y) {
                        particleAngle = 270; // Emitir hacia arriba
                    }
                }
                
                // Crear nuevas partículas
                this.createParticles(
                    tailSegment.x + this.gridSize / 2,
                    tailSegment.y + this.gridSize / 2,
                    particleAngle
                );
            }
        } else {
            this.speed = this.baseSpeed;
            this.speedBoostActive = false;
            this.boostText.setText('BOOST: OFF');
            this.boostText.setFill('#888'); // Gris
        }
        
        // Manejar entrada
        if (this.cursors.left.isDown && this.direction !== 'right') {
            this.nextDirection = 'left';
        } else if (this.cursors.right.isDown && this.direction !== 'left') {
            this.nextDirection = 'right';
        } else if (this.cursors.up.isDown && this.direction !== 'down') {
            this.nextDirection = 'up';
        } else if (this.cursors.down.isDown && this.direction !== 'up') {
            this.nextDirection = 'down';
        }
        
        // Mover la serpiente a intervalos
        if (time >= this.moveTime) {
            this.moveSnake();
            this.moveTime = time + this.speed;
        }
    }
    
    // Método para crear partículas manualmente
    createParticles(x, y, angle) {
        // Crear entre 3 y 6 partículas cada vez
        const count = Phaser.Math.Between(3, 6);
        
        for (let i = 0; i < count; i++) {
            // Calcular ángulo aleatorio dentro del rango
            const particleAngle = Phaser.Math.DegToRad(
                angle + Phaser.Math.Between(-30, 30)
            );
            
            // Velocidad aleatoria
            const speed = Phaser.Math.Between(20, 80);
            
            // Componentes de velocidad
            const vx = Math.cos(particleAngle) * speed;
            const vy = Math.sin(particleAngle) * speed;
            
            // Color aleatorio entre tonos verdosos/azulados
            const colors = [0x00ff88, 0x00ffaa, 0x00ddff];
            const color = colors[Phaser.Math.Between(0, colors.length - 1)];
            
            // Crear partícula con propiedades físicas
            this.particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                life: 1.0, // Vida máxima (se irá reduciendo)
                lifeSpeed: Phaser.Math.FloatBetween(0.01, 0.03), // Velocidad de degradación
                size: Phaser.Math.Between(4, 8), // Tamaño inicial
                color: color
            });
        }
    }
    
    // Método para actualizar las partículas existentes
    updateParticles() {
        // Limpiar el gráfico antes de redibujar
        this.trailGraphics.clear();
        
        // Actualizar cada partícula
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Actualizar posición
            p.x += p.vx * (1/60); // Asumiendo 60 FPS
            p.y += p.vy * (1/60);
            
            // Reducir vida
            p.life -= p.lifeSpeed;
            
            // Si la vida es menor o igual a 0, eliminar la partícula
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Dibujar la partícula
            const alpha = p.life; // Transparencia basada en vida
            const size = p.size * p.life; // Tamaño se reduce con la vida
            
            // Establecer estilo de relleno
            this.trailGraphics.fillStyle(p.color, alpha);
            
            // Dibujar la partícula como un círculo
            this.trailGraphics.fillCircle(p.x, p.y, size);
        }
    }
    
    drawSnake() {
        // Limpiar el gráfico anterior
        this.snakeBodyGraphics.clear();
        
        // Dibujar cada segmento de la serpiente
        for (let i = 0; i < this.snakeBody.length; i++) {
            const segment = this.snakeBody[i];
            this.snakeBodyGraphics.fillRect(segment.x, segment.y, this.gridSize, this.gridSize);
        }
    }
    
    drawFood() {
        // Limpiar el gráfico anterior
        this.foodGraphics.clear();
        
        // Dibujar la comida
        this.foodGraphics.fillRect(this.food.x, this.food.y, this.gridSize, this.gridSize);
    }
    
    moveSnake() {
        // Actualizar dirección
        this.direction = this.nextDirection;
        
        // Calcular nueva posición de la cabeza
        let x = this.snakeBody[0].x;
        let y = this.snakeBody[0].y;
        
        if (this.direction === 'left') {
            x -= this.gridSize;
        } else if (this.direction === 'right') {
            x += this.gridSize;
        } else if (this.direction === 'up') {
            y -= this.gridSize;
        } else if (this.direction === 'down') {
            y += this.gridSize;
        }
        
        // Verificar colisión con las paredes
        if (x < 0 || x >= 800 || y < 0 || y >= 600) {
            this.gameOver();
            return;
        }
        
        // Verificar colisión con el cuerpo
        for (let i = 0; i < this.snakeBody.length; i++) {
            if (x === this.snakeBody[i].x && y === this.snakeBody[i].y) {
                this.gameOver();
                return;
            }
        }
        
        // Añadir nueva cabeza
        this.snakeBody.unshift({ x, y });
        
        // Verificar colisión con la comida
        if (x === this.food.x && y === this.food.y) {
            // Reposicionar comida
            this.food.x = Math.floor(Math.random() * 40) * this.gridSize;
            this.food.y = Math.floor(Math.random() * 30) * this.gridSize;
            this.drawFood();
            
            // Aumentar puntuación
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);
            
            // Acelerar el juego
            if (this.speed > 50) {
                this.baseSpeed -= 5;
                // Aplicar el boost si está activo
                this.speed = this.speedBoostActive ? Math.floor(this.baseSpeed / 3) : this.baseSpeed;
            }
        } else {
            // Eliminar la cola si no comió
            this.snakeBody.pop();
        }
        
        // Redibujar la serpiente
        this.drawSnake();
    }
    
    gameOver() {
        // Reiniciar el juego
        this.scene.restart();
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#1a1a1a',
    scene: MainScene
};

const game = new Phaser.Game(config); 