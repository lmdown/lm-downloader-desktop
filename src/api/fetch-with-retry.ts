type RetryOptions = {
  retries: number;
  delayMs?: number;
};

export async function fetchJsonWithRetry(
  url: string,
  options: RetryOptions
): Promise<any> {
  const { retries, delayMs = 1000 } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} to fetch ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      lastError = error as Error;
      console.error(
        `Attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${
          delayMs / 1000
        } seconds`
      );

      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(`Failed to fetch ${url} after ${retries} attempts.`);
}
