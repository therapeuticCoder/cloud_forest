type ShellNavigationOptions<ResponseType> = {
  readCache: () => Promise<ResponseType | undefined>;
  network: () => Promise<ResponseType>;
};

// App updates arrive through the service-worker lifecycle. Opening an installed
// shell must not wait for an unreachable host, including a disconnected tailnet.
export async function resolveShellNavigation<ResponseType>({
  readCache,
  network,
}: ShellNavigationOptions<ResponseType>) {
  const cached = await readCache();
  return cached ?? network();
}
