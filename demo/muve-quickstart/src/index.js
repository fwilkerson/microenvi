import muve, {h, interact} from 'muve';

import './index.css';

// MODEL
const init = {};

// UPDATE
const {getModel, setModel} = interact(init);

// VIEW
const view = model => <h2>Hello, Microenvi</h2>;

// RENDER
muve(view, init, document.getElementById('root'));
