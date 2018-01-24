const ws = new WebSocket('ws://localhost:3301');

ws.onmessage = event => {
	if (event.data === 'reload') {
		setTimeout(() => self.location.reload(), 300);
	}
};

export {ws};
