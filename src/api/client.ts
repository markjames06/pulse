export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  const hasBody = options.body !== undefined;

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
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
        const errorMessage = errorData.error || `HTTP ${response.status}`;
        
        // Add extra logging for 401 errors to help debug authentication issues
        if (response.status === 401) {
          console.error('Authentication failed:', errorMessage, endpoint);
        }
        
        throw new ApiError(errorMessage, response.status);
      }

      throw new ApiError(`Server error HTTP ${response.status}`, response.status);
    }

    if (!isJson) {
      throw new Error(`API ${endpoint} returned an unexpected response.`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors, timeouts, etc.
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error. Please check your connection.', 0);
    }
    
    throw new ApiError('An unexpected error occurred. Please try again.', 500);
  }
}
