# microenvi

Microenvi is a zero configuration micro development environment. Bundle, serve, and hot reload with one command.

Transpile & bundle is done with [microbundle](https://github.com/developit/microbundle).

## Quick start

A simple hello world with microenvi and preact;

- first let's initialize our project `npm init --yes`
- then install preact `npm i -S preact`
- finally install microenvi `npm i -D microenvi`

Now add the following to your package.json

```json
{
	"main": "public/static/bundle.mjs",
	"scripts": {
		"dev": "microenvi"
	}
}
```

Create a `public` folder and add the following `index.html` to it.

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Microenvi</title>
	</head>

	<body>
		<div id="root"></div>
	</body>
</html>
```

Finally create a `src` folder and add the following `index.js` to it.

```javascript
import {h, render} from 'preact';

render(<h2>Hello, Microenvi</h2>, document.getElementById('root'));
```

Start your dev environment by running... `npm run dev`

## CLI Options

```
  Usage
    $ microenvi <command> [options]

  Available Commands
    watch    Bundle, serve, and reload

  For more info, run any command with the `--help` flag
    $ microenvi watch --help

  Options
    -v, --version    Displays current version
    --cwd            Use an alternative working directory  (default .)
    --dir            Specify the directory to watch  (default public)
    --external       Specify external dependencies  (default none)
    --globals        Specify global dependencies  (default none)
    --jsx            A custom JSX pragma like React.createElement  (default h)
    --define         Inline constants  (default none)
    --alias          Remap imports from one module to another  (default none)
    --open           Automatically open browser  (default true)
    --port           Specify a port  (default 3000)
    --single         Serve single page app  (default false)
    --ws             Specify a port for the reload ws  (default 3301)
    -h, --help       Displays this message
```

The syntax for `--define` and `--alias` are as follows:

```bash
$ microenvi --define process.env.NODE_ENV=production,NUM=123,BOOL=true
# and
$ microenvi --alias react=preact-compat,react-dom=preact-compat
```
