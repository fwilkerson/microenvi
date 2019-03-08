import {Component, h, render} from 'preact';

import './index.css';

class App extends Component {
	state = {count: 0};
	style = {counter: {margin: '0 1rem'}, resetBtn: {padding: '0 1.6rem'}};

	decrement = count => _ => this.setState({count: count - 1});
	increment = count => _ => this.setState({count: count + 1});
	reset = () => this.setState({count: 0});

	render(_, {count}) {
		return (
			<main id="app">
				<h1>Sandbox!</h1>
				<button onClick={this.decrement(count)}>-</button>
				<span style={this.style.counter}>{count}</span>
				<button onClick={this.increment(count)}>+</button>

				<br />
				<br />

				<button onClick={this.reset} style={this.style.resetBtn}>
					reset
				</button>
			</main>
		);
	}
}

render(<App />, document.body, document.getElementById('app'));
