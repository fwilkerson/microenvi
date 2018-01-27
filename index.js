const fs = require('fs');
const path = require('path');
const url = require('url');

const {send} = require('micro');
const compress = require('micro-compress');
const microbundle = require('./lib/microbundle');
const mime = require('mime-types');
const opn = require('opn');
const WebSocket = require('ws');

function getPackage(options) {
	return JSON.parse(
		fs.readFileSync(path.resolve(options.cwd, 'package.json'), 'utf8')
	);
}

const createClientWebSocket = options => `
<script>
const ws = new WebSocket('ws://localhost:${options.ws}');

ws.onmessage = event => {
	if (event.data === 'reload') {
		setTimeout(() => {
			ws.close();
			self.location.reload();
		}, 300);
	}
};
</script>`;

const createCssLink = options => {
	const {dir, pkg} = options;
	let src = pkg.main.replace(dir + '/', '');
	src = src.replace('.js', '.css');
	return `<link rel="stylesheet" href="${src}">`;
};

const createBundleScriptTag = options => {
	const {dir, pkg} = options;
	const src = pkg.main.replace(dir + '/', '');
	return `<script src="${src}"></script>`;
};

function buildIndexHtml(options, data) {
	const endOfHead = data.indexOf('</head>');

	const {bundleScriptTag, clientWebSocket, cssLink, cwd, dir, pkg} = options;

	let cssFile = path.join(cwd, pkg.main.replace('.js', '.css'));

	if (fs.existsSync(cssFile)) {
		data =
			data.slice(0, endOfHead) +
			cssLink +
			clientWebSocket +
			data.slice(endOfHead);
	} else {
		data = data.slice(0, endOfHead) + clientWebSocket + data.slice(endOfHead);
	}

	const endOfBody = data.indexOf('</body>');

	data = data.slice(0, endOfBody) + bundleScriptTag + data.slice(endOfBody);

	return data;
}

function createServe(options) {
	options.cssLink = createCssLink(options);
	options.clientWebSocket = createClientWebSocket(options);
	options.bundleScriptTag = createBundleScriptTag(options);

	return (request, response) => {
		const {pathname} = url.parse(request.url);
		let file = path.join(options.cwd, options.dir, pathname);

		fs.exists(file, exists => {
			if (!exists) {
				return send(response, 404);
			}
			if (fs.statSync(file).isDirectory()) {
				file += '/index.html';
			}
			fs.readFile(file, (error, data) => {
				if (error) send(response, 500);
				else {
					if (file.endsWith('index.html')) {
						data = buildIndexHtml(options, data);
					}
					response.setHeader('content-type', mime.lookup(file));
					send(response, 200, data);
				}
			});
		});
	};
}

process.on('SIGINT', process.exit);

module.exports = function(options) {
	let firstBuild = true;
	const wss = new WebSocket.Server({port: options.ws});

	wss.on('connection', ws => {
		// most likely this means the user manually refreshed the browser
		ws.on('error', error => {});
	});

	microbundle({
		cwd: options.cwd,
		format: 'cjs',
		onBuild(event) {
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
		},
		watch: true,
	}).catch(console.error); // todo communicate errors to client

	options.pkg = getPackage(options);

	return compress(createServe(options));
};
