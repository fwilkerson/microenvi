# microenvi

Microenvi is a zero configuration micro development environment. Bundle, serve, and hot reload with one command.

Transpile & bundle is done with [microbundle](https://github.com/developit/microbundle).

## Quick start

A simple hello world with microenvi and preact;

* first let's initialize our project `npm init --yes`
* then install preact `npm i -S preact`
* finally install microenvi `npm i -D microenvi`

Now add the following to your package.json

```json
{
	"main": "public/static/bundle.js",
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
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    $ microenvi [options]

  For more info, run any command with the `--help` flag
    $ microenvi --help

  Options
    -v, --version    Displays current version
    --cwd            Use an alternative working directory  (default .)
    --dir            Specify the directory to watch  (default public)
    --ws             Specify a port for the reload ws  (default 3301)
    --port           Specify a port  (default 3000)
    --open           Automatically open browser  (default true)
    --single         Serve single page app  (default false)
    -h, --help       Displays this message
```
