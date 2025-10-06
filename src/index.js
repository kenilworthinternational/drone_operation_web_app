import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import pilotPerformanceReducer from './store/pilotPerformanceSlice';
import pilotPerformanceReducer2 from './store/pilotPerformanceSlice2';

const store = configureStore({
  reducer: {
    pilotPerformance: pilotPerformanceReducer,
    pilotPerformance2: pilotPerformanceReducer2,
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

reportWebVitals();