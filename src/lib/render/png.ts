import renderSVG from './svg.js';
import { Cell } from '../shared-types.js';

export default function renderPNG(board: Cell[][]): Promise<Buffer> {
    const svg = renderSVG(board);
    return new Promise((resolve, reject) => {
        // There is a webserver running on port 4589 that responds with a png file when sent a svg file
        const req = fetch('http://localhost:4589/', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: svg
        });
        req.then(res => {
            if (res.ok) {
                res.arrayBuffer().then(buffer => {
                    resolve(Buffer.from(buffer));
                }).catch(reject);
            } else {
                reject(new Error(`${res.status} ${res.statusText}`));
            }
        }).catch(reject);
    });
}
