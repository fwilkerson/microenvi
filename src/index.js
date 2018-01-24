import {h, render} from 'preact';

import {Index} from './pages';
import './lib/socket';

render(<Index />, document.querySelector('#root'));
