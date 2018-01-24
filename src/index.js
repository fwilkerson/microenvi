import {h, render} from 'preact';

import './lib/socket';

const styles = {
	center: {textAlign: 'center'},
};

render(
	<h2 style={styles.center}>All the micro!</h2>,
	document.querySelector('#root')
);
