import Board from './logic/board.js';
import fs from 'node:fs';

const fileExtension: string = '.tanksav';

export function saveBoard(location: string, board: Board): void {
    const serializedBoard = board.serialize();
    if (location.startsWith('/'))
        fs.writeFileSync(`${location}${fileExtension}`, serializedBoard);
    else
        fs.writeFileSync(`./${location}${fileExtension}`, serializedBoard);
}

export function loadBoard(location: string): Board {
    if (location.startsWith('/'))
        return Board.deserialize(Buffer.from(fs.readFileSync(`${location}${fileExtension}`)));
    else
        return Board.deserialize(Buffer.from(fs.readFileSync(`./${location}${fileExtension}`)));
}