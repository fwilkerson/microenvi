#!/usr/bin/env node
const sade = require('sade');
const micro = require('micro');

const {version} = require('./package');

const prog = sade('microenvi');

prog
	.version(version)
	.option('--cwd', 'Use an alternative working directory', '.')
	.option('--dir', 'Specify the directory to watch', 'public')
	.option('--external', 'Specify external dependencies', 'none')
	.option('--globals', 'Specify global dependencies', 'none')
	.option('--jsx', 'A custom JSX pragma like React.createElement', 'h')
	.option('--define', 'Inline constants', 'none')
	.option('--alias', 'Remap imports from one module to another', 'none')
	.option('--open', 'Automatically open browser', true)
	.option('--port', 'Specify a port', 3000)
	.option('--single', 'Serve single page app', false)
	.option('--ws', 'Specify a port for the reload ws', 3301);

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
