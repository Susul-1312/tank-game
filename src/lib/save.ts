import Board from './logic/board.js';
import fs from 'node:fs';

const fileExtension: string = '.tanksav';

export function saveBoard(location: string, board: Board): void {
    const serializedBoard = board.serialize();
    Bun.write(`${location}${fileExtension}`, serializedBoard);
}

export async function loadBoard(location: string): Promise<Board> {
    const serializedBoard = Bun.file(`${location}${fileExtension}`);
    return Board.deserialize(Buffer.from(await serializedBoard.text()));
}