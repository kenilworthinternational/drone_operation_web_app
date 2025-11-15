import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a QueryClient with default options optimized for API rate limiting
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 minutes
      gcTime: 2 * 60 * 1000, // 2 minutes - keep in cache for 2 minutes (v5 uses gcTime instead of cacheTime)
      refetchOnWindowFocus: false, // Don't refetch when user switches tabs
      refetchOnMount: false, // Don't refetch on component remount if data is fresh
      retry: 2, // Retry 2 times on failure (helps with 429 errors)
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s (helps with rate limiting)
        return Math.min(1000 * 2 ** attemptIndex, 10000);
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <App />
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();