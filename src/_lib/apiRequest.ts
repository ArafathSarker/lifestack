export async function apiRequest<T>(
    {method,
     link,
     obj,
     headers
    }:
    
    {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  link: string,
  obj?: Record<string, unknown>,
  headers?: HeadersInit

}):Promise<T> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    };

    if (obj && method !== "GET" && method !== "DELETE") {
      options.body = JSON.stringify(obj);
    }

    const response = await fetch(link, options);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data: T = await response.json();
    return data;

  } catch (err) {
    throw new Error(String(err));
  }
}