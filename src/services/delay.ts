/** Mock latency. Real providers replace the functions that call this. */
export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
