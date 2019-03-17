const fs = require('fs');
const path = require('path');
const url = require('url');

const {send} = require('micro');
const microbundle = require('microbundle');
const compress = require('micro-compress');
const mime = require('mime-types');
const opn = require('opn');
const WebSocket = require('ws');

const notFound = `<h2 style=text-align:center;margin-top:2em;font-family:sans-serif;font-weight:400>404 <span style=font-size:larger>|</span> Not Found</h2>`;

function createBundleScriptTag({dir, pkg}) {
	const src = pkg.main.replace(dir + '/', '');
	return `<script src="${src}" type="module"></script>`;
}

function createClientWebSocket(options) {
	return `
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
	</script>
	`.replace(/\t|\n/g, '');
}

function createCssLink({dir, pkg}) {
	let src = pkg.main.replace(dir + '/', '');
	src = src.replace('.mjs', '.css');
	return `<link rel="stylesheet" href="${src}">`;
}

function getPackage({cwd}) {
	return JSON.parse(fs.readFileSync(path.resolve(cwd, 'package.json'), 'utf8'));
}

function buildIndexHtml(options, data) {
	if (options.single) {
		const startOfHead = data.indexOf('<head>');
		data =
			data.slice(0, startOfHead) + `<base href="/">` + data.slice(startOfHead);
	}

	const endOfHead = data.indexOf('</head>');

	const {bundleScriptTag, clientWebSocket, cssLink, cwd, pkg} = options;

	const cssFile = path.join(cwd, pkg.main.replace('.js', '.css'));

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
		// eslint-disable-next-line node/no-deprecated-api
		const {pathname} = url.parse(request.url);
		let file = path.join(options.cwd, options.dir, pathname);

		try {
			if (fs.statSync(file).isDirectory()) {
				file += '/index.html';
			}
		} catch (error) {
			if (!options.single) {
				response.setHeader('content-type', mime.lookup('.html'));
				send(response, 404, notFound);
				return;
			}

			file = path.join(options.cwd, options.dir, '/index.html');
		}

		fs.readFile(file, (err, data) => {
			if (err) {
				send(response, 500);
				return;
			}

			if (file.endsWith('index.html')) {
				data = buildIndexHtml(options, data);
			}

			response.setHeader('content-type', mime.lookup(file));
			send(response, 200, data);
		});
	};
}

process.on('SIGINT', process.exit);

module.exports = function(options) {
	let firstBuild = true;
	const wss = new WebSocket.Server({port: options.ws});

	wss.on('connection', ws => {
		// Most likely this means the user manually refreshed the browser
		ws.on('error', () => {});
	});

	microbundle({
		cwd: options.cwd,
		external: options.external,
		format: 'es',
		globals: options.globals,
		jsx: options.jsx,
		define: options.define,
		alias: options.alias,
		onBuild() {
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
		target: 'browser',
		watch: true,
	}).catch(console.error);

	options.pkg = getPackage(options);

	return compress(createServe(options));
};
