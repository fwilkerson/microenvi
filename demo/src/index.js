import {Component, h, render} from 'preact';

const styles = {
	center: {textAlign: 'center'},
	spacing: {margin: '0 1em'},
};

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {count: 0};
	}

	updateCount(value) {
		return e => {
			this.setState({count: this.state.count + value});
		};
	}

	render(props, state) {
		return (
			<main style={styles.center}>
				<h2>A fun micro dev environment!</h2>

				<button onClick={this.updateCount(-1)}>−</button>
				<em style={styles.spacing}>{state.count}</em>
				<button onClick={this.updateCount(1)}>+</button>
			</main>
		);
	}
}

render(<App />, document.querySelector('#root'));
