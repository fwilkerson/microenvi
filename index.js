const fs = require('fs');
const path = require('path');
const url = require('url');

const {send} = require('micro');
const compress = require('micro-compress');
const microbundle = require('./lib/microbundle');
const mime = require('mime-types');
const opn = require('opn');
const WebSocket = require('ws');

const createClientWebSocket = options => `<script>
const ws = new WebSocket('ws://localhost:${options.ws}');

ws.onmessage = event => {
	if (event.data === 'reload') {
		setTimeout(() => {
			ws.close();
			self.location.reload();
		}, 300);
	}
};</script>`;

function createServe(options) {
	const clientWebSocket = createClientWebSocket(options);
	return (request, response) => {
		const {pathname} = url.parse(request.url);
		let file = path.join(options.cwd, options.dir, pathname);

		fs.exists(file, exists => {
			if (!exists) return send(response, 404);

			if (fs.statSync(file).isDirectory()) {
				file += '/index.html';
			}

			fs.readFile(file, (error, data) => {
				if (error) send(response, 500);
				else {
					if (file.endsWith('index.html')) {
						const endOfHead = data.indexOf('</head>');
						data =
							data.slice(0, endOfHead) +
							clientWebSocket +
							data.slice(endOfHead);
					}

					response.setHeader('content-type', mime.lookup(file));
					send(response, 200, data);
				}
			});
		});
	};
}

module.exports = function(options) {
	let firstBuild = true;
	const wss = new WebSocket.Server({port: options.ws});

	wss.on('connection', ws => {
		// most likely this means the user manually refreshed the browser
		ws.on('error', error => {});
	});

	process.on('event', event => {
		if (event.code === 'END') {
			if (firstBuild && options.open) {
				firstBuild = false;
				opn(`http://localhost:${options.port}`).catch(console.error);
			} else {
				wss.clients.forEach(client => {
					if (client.readyState === WebSocket.OPEN) {
						client.send('reload');
					}
				});
			}
		}
	});

	microbundle({
		cwd: options.cwd,
		format: 'es',
		watch: true,
		emit: true,
	}).catch(console.error);

	return compress(createServe(options));
};
