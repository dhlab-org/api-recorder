export const isSocketIOAvailable = (): boolean => {
  return Boolean((globalThis as any).__API_RECORDER_HAS_SOCKET_IO);
};
