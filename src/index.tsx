import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider as ReduxProvider } from 'react-redux';
import combineReducer from 'modules/combineReducer';
import initialState from 'modules/initialState';
import ReduxThunk from 'redux-thunk';

let store;
if (process.env.NODE_ENV === 'production') {
  store = createStore(
    combineReducer,
    initialState,
    applyMiddleware(ReduxThunk),
  );
} else {
  store = createStore(
    combineReducer,
    initialState,
    composeWithDevTools(applyMiddleware(ReduxThunk)),
  );
}

ReactDOM.render(
  <ReduxProvider store={store}>
    <App />
  </ReduxProvider>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
