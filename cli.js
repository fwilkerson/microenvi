#!/usr/bin/env node
const sade = require('sade');
const micro = require('micro');

const {version} = require('./package');

const prog = sade('microenvi');

prog
	.version(version)
	.option('--cwd', 'Use an alternative working directory', '.')
	.option('--dir', 'Specify the directory to watch', 'public')
	.option('--ws', 'Specify a port for the reload ws', 3301)
	.option('--port', 'Specify a port', 3000)
	.option('--open', 'Automaticall open browser', true);

prog
	.command('watch', '', {default: true})
	.describe('Bundle, serve, and reload')
	.action(run);

prog.parse(process.argv);

function run(options) {
	const server = micro(require('.')(options));
	server.listen(options.port, () => {
		process.stdout.write('microenvi running on: ' + options.port + '\n');
	});
}
