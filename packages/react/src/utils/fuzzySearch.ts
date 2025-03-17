/**
 * A super simple fuzzy search that checks if query characters appear in order in the target string
 * Case-insensitive matching
 */
export function fuzzySearch(query: string, target: string): boolean {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  let queryIndex = 0;
  let targetIndex = 0;

  while (queryIndex < queryLower.length && targetIndex < targetLower.length) {
    if (queryLower[queryIndex] === targetLower[targetIndex]) {
      queryIndex++;
    }
    targetIndex++;
  }

  return queryIndex === queryLower.length;
}
