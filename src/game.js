import 'phaser';

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.snake = null;
        this.food = null;
        this.cursors = null;
        this.speed = 200;
        this.moveTime = 0;
        this.snakeBody = [];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.gridSize = 20;
    }

    preload() {
        // No necesitamos cargar imágenes, crearemos gráficos directamente
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
        
        // Añadir texto de puntuación (solo una vez)
        this.scoreText = this.add.text(16, 16, 'Score: 0', { 
            fontSize: '32px', 
            fill: '#fff' 
        });
        
        this.score = 0;
    }

    update(time) {
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
                this.speed -= 5;
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