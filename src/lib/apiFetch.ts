export async function apiFetch<T = any>(url: string, options?: RequestInit): Promise<any> {
  const isRealApi = url.startsWith('/api/requests') || url.startsWith('/api/auth');
  
  if (isRealApi) {
    console.log(`[Real API Fetch] ${options?.method || 'GET'} ${url}`);
    return await fetch(url, options);
  }

  console.log(`[Mock API Fetch] ${options?.method || 'GET'} ${url}`);

  const mockData = {
    success: true,
    notifications: [],
    data: [],
    list: [],
    items: [],
    total: 0,
    requests: [],
  };

  return {
    ok: true,
    status: 200,
    json: async () => mockData,
    text: async () => JSON.stringify(mockData),
    ...mockData,
  };
}

export default apiFetch;
