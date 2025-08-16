function detectDuplicates(json: string) {
  const keyCounts: Record<string, number> = {};
  const regex = /"([^"]+)"\s*:/g;

  let match;
  while ((match = regex.exec(json)) !== null) {
    const key = match[1];
    keyCounts[key] = (keyCounts[key] || 0) + 1;
  }

  return Object.entries(keyCounts)
    .filter(([_, count]) => count > 1)
    .map(([key]) => key);
}

export { detectDuplicates }