export const navigationNetworkTimeoutMs = 3_000;

type NetworkFirstOptions<ResponseType> = {
  fallback: () => Promise<ResponseType>;
  network: () => Promise<ResponseType>;
  timeoutMs?: number;
};

export async function resolveNetworkFirst<ResponseType>({
  fallback,
  network,
  timeoutMs = navigationNetworkTimeoutMs,
}: NetworkFirstOptions<ResponseType>) {
  let fallbackPromise: Promise<ResponseType> | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const useFallback = () => {
    fallbackPromise ??= fallback();
    return fallbackPromise;
  };

  const timeoutResponse = new Promise<ResponseType>((resolve, reject) => {
    timeoutId = setTimeout(() => {
      void useFallback().then(resolve, reject);
    }, timeoutMs);
  });

  try {
    return await Promise.race([network().catch(useFallback), timeoutResponse]);
  } finally {
    clearTimeout(timeoutId);
  }
}
