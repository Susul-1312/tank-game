import Board from './lib/logic/board.js';
import Tank from './lib/logic/tank.js';
import renderBoard from './lib/render/png.js';
import fs from 'node:fs';
import { saveBoard } from './lib/save.js';

const board: Board = new Board(10, 12);
const tank1: Tank = new Tank('Tänk 1');
const tank2: Tank = new Tank('Tank €2');
board.addTank(tank1, 4, 3);
board.addTank(tank2, 6, 3);
board.giveChips(5);
tank1.upgrade();
tank1.attack(tank2);
fs.writeFileSync('board.png', await renderBoard(board.board));

saveBoard('board', board);