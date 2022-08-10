import Board from './lib/logic/board';
import Tank from './lib/logic/tank';
import makeBoard from './lib/render/svg';
import fs from 'node:fs';
import { saveBoard } from './lib/save';

const board: Board = new Board(10, 12);
const tank1: Tank = new Tank('Tänk 1');
const tank2: Tank = new Tank('Tank €2');
board.addTank(tank1, 4, 3);
board.addTank(tank2, 6, 3);
board.giveChips(5);
tank1.upgrade();
tank1.attack(tank2);
fs.writeFileSync('board.svg', makeBoard(board.board));
saveBoard('board', board);