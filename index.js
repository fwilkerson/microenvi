const fs = require('fs');
const path = require('path');
const mime = require('mime');
const url = require('url');

const chokidar = require('chokidar');
const {send} = require('micro');
const compress = require('micro-compress');
const microbundle = require('microbundle');
const WebSocket = require('ws');

const wss = new WebSocket.Server({port: 3301});
const watcher = chokidar.watch(path.join(__dirname, 'public'));

wss.on('connection', ws => {
	ws.on('error', error => {
		// most likely this means the user manually refreshed the browser
	});
});

watcher.on('change', (path, stats) => {
	// a better solution would be to debeounce the reload event
	if (path.endsWith('.map')) return;

	wss.clients.forEach(client => {
		if (client.readyState === WebSocket.OPEN) client.send('reload');
	});
});

// I'll need to get this info from the user
microbundle({
	cwd: __dirname,
	format: 'es',
	jsx: 'h',
	watch: true,
}).catch(console.error);

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
