const fs = require('fs');
const path = require('path');
const mime = require('mime');
const url = require('url');

const chokidar = require('chokidar');
const {send} = require('micro');
const compress = require('micro-compress');
const WebSocket = require('ws');

const wss = new WebSocket.Server({port: 3301});
const watcher = chokidar.watch(path.join(__dirname, 'public'));

watcher.on('change', (path, stats) => {
	// a better solution would be to debeounce the reload event
	if (path.endsWith('.map')) return;

	wss.clients.forEach(client => {
		if (client.readyState === WebSocket.OPEN) client.send('reload');
	});
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
