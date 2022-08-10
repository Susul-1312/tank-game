import http from 'http';
import { createCanvas, loadImage } from 'canvas';

// Create a server that listens for a post request
const server = http.createServer(async (req, res) => {
    console.log("Received Request")
    // If the request is a post request, try to parse the body as SVG
    if (req.method === 'POST') {
        const body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', async () => {
            const svg = Buffer.concat(body);
            console.log(svg)
            const width_and_height = svg.toString().split("\"")
            // Create a canvas and draw the SVG onto it
            const canvas = createCanvas(parseInt(width_and_height[1]), parseInt(width_and_height[3]));
            const ctx = canvas.getContext('2d');
            const img = await loadImage(svg);
            ctx.drawImage(img, 0, 0);
            // Create a buffer from the canvas and send it as a response
            const buffer = await canvas.toBuffer("image/png");
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': buffer.length
            });
            res.end(buffer);
        }).on('error', (err) => {
            console.error(err);
            res.end();
        })
    }
}).listen(4589, () => {
    console.log('Server running on port 4589');
}).on('error', (err) => {
    console.error(err);
})
