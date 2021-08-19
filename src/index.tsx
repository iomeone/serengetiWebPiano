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
import { BrowserRouter } from 'react-router-dom';
import { State } from 'modules/State';
import produce from 'immer';

let store;
if (process.env.NODE_ENV === 'production') {
  store = createStore(
    combineReducer,
    initialState,
    applyMiddleware(ReduxThunk),
  );
} else {
  const options = {
    actionSanitizer: (action: any) => {
      switch (action.type) {
        case '@AUDIO/ADD_SHEET':
          return { ...action, osmd: 'OSMD Object' };
        case '@AUDIO/SET_AUDIO_CONTEXT':
          return { ...action, audioContext: 'Audio Context Object' };
        default:
          return action;
      }
    },
    stateSanitizer: (state: any) => {
      return produce(state as State, (draft) => {
        for (const key of Object.keys(draft.audio.sheets)) {
          draft.audio.sheets[key].osmd = 'OSMD Object';
        }
        if (draft.audio.audioContext !== null)
          //@ts-ignore
          draft.audio.audioContext = 'Audio Context Object';
      }) as any;
    },
  };
  const componseEnhancers = composeWithDevTools(options);

  store = createStore(
    combineReducer,
    initialState,
    componseEnhancers(applyMiddleware(ReduxThunk)),
  );
}

ReactDOM.render(
  <ReduxProvider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ReduxProvider>,
  document.getElementById('root'),
);

reportWebVitals();
