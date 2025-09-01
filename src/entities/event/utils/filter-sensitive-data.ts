/**
 * 민감한 헤더 정보를 필터링
 */
export const filterSensitiveHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
  // biome-ignore lint: authorization is intentionally destructured to remove it
  const { Authorization, ...filteredHeaders } = headers;
  return filteredHeaders;
};
