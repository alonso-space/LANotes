export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

function errorMessage(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string') {
    return data.error;
  }

  return 'Algo salió mal. Inténtalo de nuevo.';
}

export async function request<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(errorMessage(data), response.status);
  }

  return data as T;
}
