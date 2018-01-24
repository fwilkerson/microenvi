const fs = require('fs');
const path = require('path');
const mime = require('mime');
const url = require('url');

const {send} = require('micro');
const compress = require('micro-compress');
const WebSocket = require('ws');

const wss = new WebSocket.Server({port: 3301});

process.on('SIGUSR2', () => {
	wss.clients.forEach((client, i) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send('reload');
		}
	});

	wss.close();
});

function serve(request, response) {
	const {pathname} = url.parse(request.url);
	let file = path.join(__dirname, 'public', pathname);

	fs.exists(file, exists => {
		if (!exists) return send(response, 404);

		if (fs.statSync(file).isDirectory()) {
			file += '/index.html';
		}

		fs.readFile(file, (error, data) => {
			if (error) send(response, 500);
			else {
				response.setHeader('content-type', mime.lookup(file));
				send(response, 200, data);
			}
		});
	});
}

module.exports = compress(serve);
