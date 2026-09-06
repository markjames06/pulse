export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  const hasBody = options.body !== undefined;

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    credentials: 'include',
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = Boolean(contentType && contentType.includes('application/json'));

  if (!response.ok) {
    if (isJson) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    throw new Error(`Server error HTTP ${response.status}`);
  }

  if (!isJson) {
    throw new Error(`API ${endpoint} returned an unexpected response.`);
  }

  return response.json() as Promise<T>;
}
