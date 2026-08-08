let currentActiveUserId =
  typeof localStorage !== 'undefined' ? localStorage.getItem('pulse_user_id') || '' : '';

export function setApiActiveUserId(userId: string) {
  currentActiveUserId = userId;
}

export function getApiActiveUserId() {
  return currentActiveUserId;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('x-user-id', currentActiveUserId);

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    if (isJson) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    throw new Error(`Server error HTTP ${response.status}`);
  }

  if (!isJson) {
    throw new Error(`Invalid non-JSON response from ${endpoint}`);
  }

  return response.json();
}
