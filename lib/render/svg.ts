import { Cell } from '../shared-types'

export default function makeBoard(board: Cell[][]): string {
    return `<svg width="1000" heigth="1000" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="100%" height="100%" fill="#aaa" />${renderGrid(board)}</svg>`
}

function renderGrid(grid: Cell[][]): string {
    const cellTemplate: string = '<rect x="%x" y="%y" width="%size" height="%size" stroke="#000" stroke-width="3" fill="%colour" />'
    const squareSize: number = 100;
    const gridString: string = Array(grid.length).fill(null).map((_, y) => Array(grid[0].length).fill(null).map((_, x) =>
        renderCell(cellTemplate, x, y, squareSize, grid)
    ).join('')).join('')

    return gridString;
}

function renderCell(cellTemplate: string, x: number, y: number, squareSize: number, grid: Cell[][]): string {
    if (grid[y][x] == null) {
        return cellTemplate
            .replace('%x', (x * squareSize).toString())
        .replace('%y', (y * squareSize).toString())
        .replace(/%size/g, squareSize.toString())
        .replace(/%colour/g, '#ccc');
    } else {
        const tank = grid[y][x]!;

        // Find high contrast text colour based on tank colour
        const textColor: string = tank.color == '#000' ? '#fff' : '#000';

        const font = "sans-serif";
        // render tank stats at square if tank is present
        return cellTemplate
            .replace('%x', (x * squareSize).toString())
            .replace('%y', (y * squareSize).toString())
            .replace(/%size/g, squareSize.toString())
            .replace(/%colour/g, tank.color) +
            `<text x="${(x * squareSize) + (squareSize / 2)}" y="${(y * squareSize) + (squareSize / 5)}" text-anchor="middle" alignment-baseline="middle" font-family="${font}" font-size="${squareSize / 5}" fill="${textColor}">${tank.name}</text>` +
            `<text x="${(x * squareSize) + (squareSize / 2)}" y="${(y * squareSize) + (squareSize / 5) * 2}" text-anchor="middle" alignment-baseline="middle" font-family="${font}" font-size="${squareSize / 5}" fill="${textColor}">Health: ${tank.getHealth()}</text>` +
            `<text x="${(x * squareSize) + (squareSize / 2)}" y="${(y * squareSize) + (squareSize / 5) * 3}" text-anchor="middle" alignment-baseline="middle" font-family="${font}" font-size="${squareSize / 5}" fill="${textColor}">Chips: ${tank.getChips()}</text>` +
            `<text x="${(x * squareSize) + (squareSize / 2)}" y="${(y * squareSize) + (squareSize / 5) * 4}" text-anchor="middle" alignment-baseline="middle" font-family="${font}" font-size="${squareSize / 5}" fill="${textColor}">Range: ${tank.getRange()}</text>`
    }
}
