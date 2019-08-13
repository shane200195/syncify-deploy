import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

////Made by 5HAN3 D1NG
it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

