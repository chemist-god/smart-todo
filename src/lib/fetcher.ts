export async function fetcher<T = unknown>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const res = await fetch(input, init);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed with ${res.status}`);
    }
    return res.json() as Promise<T>;
}


