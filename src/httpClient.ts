
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5183/api";

const TOKEN_KEY = "peopledesk_access_token";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  requiresAuth?: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const tokenStorage = {
  get(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  },

  set(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
  },

  clear(): void {
    sessionStorage.removeItem(TOKEN_KEY);
  },
};

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    body,
    requiresAuth = true,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const headers = new Headers(customHeaders);

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Accept", "application/json");

  if (requiresAuth) {
    const token = tokenStorage.get();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  const responseBody = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof responseBody === "object" &&
      responseBody !== null &&
      "message" in responseBody
        ? String(responseBody.message)
        : `API request failed with status ${response.status}`;

    if (response.status === 401) {
  tokenStorage.clear();

  window.dispatchEvent(
    new Event("peopledesk:unauthorized")
  );
}

    throw new ApiError(message, response.status);
  }

  return responseBody as T;
}
