const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const localApiUrl =
  import.meta.env.VITE_LOCAL_API_URL?.trim() || 'http://localhost:8000';
const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);
const useRemoteInLocal = import.meta.env.VITE_USE_REMOTE_API === 'true';

export const serverUrl =
  isLocalhost && !useRemoteInLocal
    ? localApiUrl
    : configuredApiUrl || localApiUrl;
