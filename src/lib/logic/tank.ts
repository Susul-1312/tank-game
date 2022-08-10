import Board from "./board";
import { Direction, TankError } from '../shared-types';

export default class Tank {
    name: string;
    color: string;
    private alive: boolean;
    private health: number;
    private range: number;
    private chips: number;

    board: Board;
    x: number;
    y: number;

    constructor(name: string, color?: string, alive?: boolean, health?: number, chips?: number, range?: number) {
        // Names cannot be longer than 8 characters and may only contain ascii
        this.name = name.normalize("NFD").replace(/[^\p{ASCII}]/gu, "").substring(0, 8);
        this.color = color || "#" + ((1 << 24) * Math.random() | 0).toString(16);
        this.alive = alive || true;
        this.health = health || 3;
        this.chips = chips || 0;
        this.range = range || 1;
    }

    // Check Functions
    isAlive(): boolean {
        return this.alive;
    }

    getRange(): number {
        return this.range;
    }

    getHealth(): number {
        return this.health;
    }

    getChips(): number {
        return this.chips;
    }

    // Passive Functions
    hit(damage: number): void {
        this.health -= damage;
        this.health = Math.max(this.health, 0);
        if (this.health == 0)
            this.kill();
    }

    addChip(chip: number): void {
        this.chips += chip;
        this.chips = Math.min(this.chips, 255);
    }

    kill(): void {
        this.alive = false;
        console.log(`${this.name} died`);
        this.board.softRemoveTank(this);
    }

    // Action Functions
    move(direction: Direction): void {
        if (this.chips < 1) throw new TankError("Tank has no chips")
        this.chips--;
        this.board.moveTank(this, direction);
    }

    attack(target: Tank): void {
        if (this.chips < 1) throw new TankError("Tank has no chips")
        this.chips--;
        this.board.attackTank(this, target);
    }

    upgrade(): void {
        if (this.chips < 1) throw new TankError("Tank has no chips")
        if (this.range >= 255) throw new TankError("Tank cannot upgrade anymore")
        this.range++;
        this.chips--;
    }

    transferChips(chips: number, tank: Tank): void {
        if (tank === this) throw new TankError("Cannot transfer chips to self")
        if (this.chips < chips) throw new TankError("Tank has insufficient chips")
        if (chips < 0) throw new TankError("Cannot transfer negative chips")
        if (Math.abs(tank.x - this.x) > this.range || Math.abs(tank.y - this.y) > this.range) throw new TankError("Tank can only transfer chips to tanks within range")
        this.chips -= chips;
        tank.addChip(chips);
    }

    toString(): string {
        return `${this.name}, ${this.alive ? "Alive" : "Dead"}, Chips: ${this.chips}`
    }
    toJSON(): string {
        return JSON.stringify({
            name: this.name,
            alive: this.alive,
            chips: this.chips
        })
    }
    static serializeBinary(tank: Tank): Buffer {
        // Serialize to a binary string in the format:
        // [name 8 byte string][color 4 bytes][alive 1 byte][health 1 byte integer][chips 1 byte integer][range 1 byte integer][x 2 byte integer][y 2 byte integer]
        const buffer = Buffer.alloc(8 + 4 + 1 + 1 + 1 + 1 + 2 + 2);
        buffer.write(tank.name, 0, 8, "ascii");
        const color = parseInt(tank.color.substring(1), 16);
        buffer.writeUInt32BE(color, 8);
        buffer.writeUInt8(tank.alive ? 1 : 0, 12);
        buffer.writeUInt8(tank.health, 13);
        buffer.writeUInt8(tank.chips, 14);
        buffer.writeUInt8(tank.range, 15);
        buffer.writeUInt16BE(tank.x, 16);
        buffer.writeUInt16BE(tank.y, 18);
        return buffer;
    }
    static deserializeBinary(buffer: Buffer): Tank {
        // Deserialize from a binary string in the format:
        // [name 8 byte string][color 4 bytes][alive 1 byte][health 1 byte integer][chips 1 byte integer][range 1 byte integer][x 2 byte integer][y 2 byte integer]
        const name = buffer.toString("ascii", 0, 8);
        const color = "#" + buffer.readUInt32BE(8).toString(16);
        const alive = buffer.readUInt8(12) === 1;
        const health = buffer.readUInt8(13);
        const chips = buffer.readUInt8(14);
        const range = buffer.readUInt8(15);
        const x = buffer.readUInt16BE(16);
        const y = buffer.readUInt16BE(18);
        const tank: Tank = new Tank(name, color, alive, health, chips, range);
        tank.x = x;
        tank.y = y;
        return tank;
    }

    static serializedSize = 8 + 4 + 1 + 1 + 1 + 1 + 2 + 2 + 2; // for some reason this needs to be 2 bytes larger than the actual size, otherwise we get an error. I blame black magic.

}