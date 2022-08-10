import renderSVG from './svg.js';
import { Cell } from '../shared-types.js';
export default function renderPNG(board: Cell[][]): Promise<Buffer> {
    const svg = renderSVG(board);
    return new Promise((resolve, reject) => {
        resolve(Buffer.from("TODO"));
    });
}
