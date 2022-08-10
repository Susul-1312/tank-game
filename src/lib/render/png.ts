import makeBoard from './svg.js';
import { Cell } from '../shared-types.js';

export default async function renderBoard(board: Cell[][]): Buffer {
    const svg: string = makeBoard(board);
    const png: Buffer = Buffer.from("png")
    return png;
}