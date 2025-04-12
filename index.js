import 'phaser';

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // No necesitamos precargar imágenes, usaremos gráficos generados
    }

    create() {
        // Inicialización de variables
        this.gridSize = 16; // Tamaño de cada celda de la cuadrícula
        this.snake = []; // Array para almacenar los segmentos de la serpiente
        this.food = null; // Posición de la comida
        this.direction = 'right'; // Dirección inicial
        this.moveTime = 0; // Control de tiempo para el movimiento
        this.speed = 150; // Velocidad inicial (ms)
        this.alive = true; // Estado del juego
        this.score = 0; // Puntuación

        // Crear serpiente inicial (3 segmentos)
        for (let i = 0; i < 3; i++) {
            this.snake.push({
                x: 10 - i, // Posición horizontal, decrementando para crear segmentos hacia la izquierda
                y: 10      // Posición vertical constante
            });
        }

        // Configurar controles
        this.cursors = this.input.keyboard.createCursorKeys();

        // Crear grupo para los gráficos de la serpiente
        this.snakeBody = this.add.group();

        // Generar la primera comida
        this.addFood();

        // Añadir texto para la puntuación
        this.scoreText = this.add.text(16, 16, 'Puntuación: 0', {
            fontSize: '18px',
            fill: '#fff'
        });
    }

    update(time) {
        // Si el juego terminó, no actualizar nada
        if (!this.alive) return;

        // Manejar entrada del teclado
        if (this.cursors.left.isDown && this.direction !== 'right') {
            this.direction = 'left';
        } else if (this.cursors.right.isDown && this.direction !== 'left') {
            this.direction = 'right';
        } else if (this.cursors.up.isDown && this.direction !== 'down') {
            this.direction = 'up';
        } else if (this.cursors.down.isDown && this.direction !== 'up') {
            this.direction = 'down';
        }

        // Mover la serpiente basado en el tiempo
        if (time >= this.moveTime) {
            // Calcular nueva posición de la cabeza
            let headX = this.snake[0].x;
            let headY = this.snake[0].y;

            // Actualizar posición basada en dirección
            switch (this.direction) {
                case 'left':
                    headX--;
                    break;
                case 'right':
                    headX++;
                    break;
                case 'up':
                    headY--;
                    break;
                case 'down':
                    headY++;
                    break;
            }

            // Verificar colisiones
            if (this.checkCollision(headX, headY)) {
                this.gameOver();
                return;
            }

            // Verificar si la serpiente come
            let didEat = false;
            if (this.food && headX === this.food.x && headY === this.food.y) {
                didEat = true;
                this.score += 10;
                this.scoreText.setText('Puntuación: ' + this.score);
                this.addFood();
                
                // Aumentar velocidad cada 5 comidas
                if (this.score % 50 === 0) {
                    this.speed = Math.max(50, this.speed - 10);
                }
            }

            // Si no comió, quitar la cola
            if (!didEat) {
                this.snake.pop();
            }

            // Añadir nueva cabeza
            this.snake.unshift({ x: headX, y: headY });

            // Actualizar tiempo para el próximo movimiento
            this.moveTime = time + this.speed;
            
            // Actualizar gráficos
            this.updateGraphics();
        }
    }

    checkCollision(x, y) {
        // Límites del juego
        const width = Math.floor(this.game.config.width / this.gridSize);
        const height = Math.floor(this.game.config.height / this.gridSize);

        // Colisión con bordes
        if (x < 0 || y < 0 || x >= width || y >= height) {
            return true;
        }

        // Colisión con la propia serpiente (excepto la cabeza)
        for (let i = 1; i < this.snake.length; i++) {
            if (x === this.snake[i].x && y === this.snake[i].y) {
                return true;
            }
        }

        return false;
    }

    addFood() {
        // Límites del juego
        const width = Math.floor(this.game.config.width / this.gridSize);
        const height = Math.floor(this.game.config.height / this.gridSize);

        // Encontrar una posición válida para la comida
        let validPosition = false;
        let x, y;

        while (!validPosition) {
            validPosition = true;
            
            // Generar posición aleatoria
            x = Math.floor(Math.random() * width);
            y = Math.floor(Math.random() * height);

            // Verificar que no está sobre la serpiente
            for (let segment of this.snake) {
                if (segment.x === x && segment.y === y) {
                    validPosition = false;
                    break;
                }
            }
        }

        // Establecer la nueva comida
        this.food = { x, y };
    }

    updateGraphics() {
        // Limpiar gráficos anteriores
        this.snakeBody.clear(true, true);

        // Dibujar comida (rojo)
        if (this.food) {
            const foodGraphic = this.add.rectangle(
                this.food.x * this.gridSize + this.gridSize / 2,
                this.food.y * this.gridSize + this.gridSize / 2,
                this.gridSize - 2,
                this.gridSize - 2,
                0xff0000
            );
            this.snakeBody.add(foodGraphic);
        }

        // Dibujar serpiente
        this.snake.forEach((segment, index) => {
            // Color verde para la cabeza, verde más oscuro para el cuerpo
            const color = index === 0 ? 0x00ff00 : 0x008800;
            
            const segmentGraphic = this.add.rectangle(
                segment.x * this.gridSize + this.gridSize / 2,
                segment.y * this.gridSize + this.gridSize / 2,
                this.gridSize - 2,
                this.gridSize - 2,
                color
            );
            this.snakeBody.add(segmentGraphic);
        });
    }

    gameOver() {
        this.alive = false;

        // Mostrar texto de Game Over
        const gameOverText = this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 2 - 50,
            'GAME OVER',
            {
                fontSize: '32px',
                fill: '#fff'
            }
        );
        gameOverText.setOrigin(0.5);

        // Mostrar puntuación final
        const finalScoreText = this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 2,
            'Puntuación final: ' + this.score,
            {
                fontSize: '24px',
                fill: '#fff'
            }
        );
        finalScoreText.setOrigin(0.5);

        // Instrucciones para reiniciar
        const restartText = this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 2 + 50,
            'Presiona ESPACIO para reiniciar',
            {
                fontSize: '18px',
                fill: '#fff'
            }
        );
        restartText.setOrigin(0.5);

        // Configurar tecla para reiniciar
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.restart();
        });
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
