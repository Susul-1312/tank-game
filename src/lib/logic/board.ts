import Tank from './tank.js';
import { Direction, TankError, Cell } from '../shared-types.js';

class Board {
    board: Array<Array<Cell>>;
    xSize: number;
    ySize: number;
    tanks: Tank[];
    constructor(xSize: number, ySize: number) {
        if (xSize < 1 || Math.floor(xSize) != xSize) throw TypeError("xSize must be a positive integer")
        if (ySize < 1 || Math.floor(ySize) != ySize) throw TypeError("ySize must be a positive integer")
        if (xSize > 65535) throw TypeError("xSize must be less than 65,535")
        if (ySize > 65535) throw TypeError("ySize must be less than 65,535")

        this.xSize = xSize;
        this.ySize = ySize;
        this.tanks = [];

        this.board = Array(this.ySize).fill(null).map(() => Array(this.xSize).fill(null));
    }

    addTank(tank: Tank, x?: number, y?: number): void {
        if (this.tanks.length > this.xSize * this.ySize) throw new TankError("Too many Tanks on Board")
        // Check if x xor y are undefined
        if ((x == undefined) != (y == undefined)) throw new TankError("Must specify both x and y or neither")

        // If no x and y are given, place tank in a random position
        if (x == undefined || y == undefined) {
            do {
                x = Math.floor(Math.random() * (this.xSize - 1))
                y = Math.floor(Math.random() * (this.ySize - 1))
            } while (this.getPosition(x, y) != null)
        }

        // If x and y are given, check that they are valid (Like you <3)
        if (x < 0 || Math.floor(x) != x) throw new TypeError("x must be a positive integer")
        if (y < 0 || Math.floor(y) != y) throw new TypeError("y must be a positive integer")
        if (x < 0 || x >= this.xSize || y < 0 || y >= this.ySize) throw new TankError("Tank can't be placed out of bounds")
        if (this.getPosition(x, y) != null) throw new TankError("Tank can't be placed on another tank")

        this.board[y][x] = tank
        this.tanks.push(tank)

        tank.x = x;
        tank.y = y;
        tank.board = this;
    }

    softRemoveTank(tank: Tank): void {
        this.board[tank.y][tank.x] = null
    }

    removeTank(tank: Tank): void {
        this.softRemoveTank(tank)
        this.tanks = this.tanks.filter(t => t != tank)
    }

    addSerializedTank(serializedTank: Buffer): void {
        const tank = Tank.deserializeBinary(serializedTank)
        tank.board = this;
        this.addTank(tank, tank.x, tank.y)
    }

    serialize(): Buffer {
        // Serialize the board in the following format:
        // [xSize 16 bits] [ySize 16 bits] [tank 1] [tank 2] ... [tank n]
        const buffer = Buffer.alloc(2 + this.tanks.length * Tank.serializedSize)
        buffer.writeUInt16BE(this.xSize, 0)
        buffer.writeUInt16BE(this.ySize, 2)
        let offset = 4;
        this.tanks.forEach(tank => {
            const tankBuffer = Tank.serializeBinary(tank)
            tankBuffer.copy(buffer, offset)
            offset += Tank.serializedSize
        }
        )
        return buffer
    }

    static deserialize(buffer: Buffer): Board {
        const xSize = buffer.readUInt16BE(0)
        const ySize = buffer.readUInt16BE(2)
        const board = new Board(xSize, ySize)
        let offset = 4;
        while (offset < buffer.length) {
            const tank = Tank.deserializeBinary(buffer.subarray(offset))
            board.addTank(tank, tank.x, tank.y)
            offset += Tank.serializedSize
        }
        return board
    }

    moveTank(tank: Tank, direction: Direction): void {
        let x = tank.x;
        let y = tank.y;
        switch (direction) {
            case 'up':
                y--;
                break;
            case 'down':
                y++;
                break;
            case 'left':
                x--;
                break;
            case 'right':
                x++;
                break;
        }
        if (x < 0 || x >= this.xSize || y < 0 || y >= this.ySize) throw new TankError("Tank can't move out of bounds")
        if (this.getPosition(x, y) != null) throw new TankError("Tank can't move into another tank")
        this.board[y][x] = tank;
        this.board[tank.y][tank.x] = null;
        tank.x = x;
        tank.y = y;
    }
    attackTank(tank: Tank, target: Tank): void {
        if (Math.abs(tank.x - target.x) > tank.getRange() || Math.abs(tank.y - target.y) > tank.getRange()) throw new TankError("Target is out of range")
        if (target.isAlive() == false) throw new TankError("Target is already dead")
        target.hit(1);
    }

    giveChips(chips: number): void {
        if (this.tanks.length == 0) throw new TankError("No tanks on board")
        this.tanks.forEach(tank => tank.addChip(chips))
    }

    getPosition(x: number, y: number): Cell {
        return this.board[y][x]
    }
}

export default Board;