type RetryOptions = {
  retries: number;
  delayMs?: number;
  timeoutMs?: number;
};

export async function fetchJsonWithRetry(
  url: string,
  options: RetryOptions
): Promise<any> {
  const { retries, delayMs = 1000, timeoutMs = 5000 } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(`Attempt ${attempt + 1} to fetch ${url}. timeoutMs ${timeoutMs}`);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed: ${lastError.message}`);

      if (attempt < retries - 1) {
        console.log(`Retrying in ${delayMs / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error(`Failed to fetch ${url} after ${retries} attempts.`);
}
