import Tank from './logic/tank.js';

export type Cell = Tank | null;
export type Direction = 'up' | 'down' | 'left' | 'right';
export class TankError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TankError"
    }
}