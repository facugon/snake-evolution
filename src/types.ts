import { Scene } from 'phaser';

// Define la extensión de la clase Scene para incluir propiedades personalizadas
export interface GameScene extends Scene {
    gridSize: number;
}

export interface Position {
    x: number;
    y: number;
}

export interface Segment {
    x: number;
    y: number;
}

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    lifeSpeed: number;
    size: number;
    color: number;
}

export interface Mole {
    position: Position;
    expiryTime: number;
}

export interface CollisionResult {
    collision: boolean;
    position?: Position;
}

// Definición para objetos TextStyle de Phaser  
export interface CustomTextStyle extends Phaser.Types.GameObjects.Text.TextStyle {
    fill?: string;
} 