export const calculateHighlightSegments = (
  text: string,
  searchQuery: string
): { text: string; highlighted: boolean }[] => {
  if (!searchQuery.trim()) {
    return [{ text, highlighted: false }];
  }

  const keywords = searchQuery
    .trim()
    .split(/\s+/)
    .filter(k => k.length > 0);

  if (keywords.length === 0) {
    return [{ text, highlighted: false }];
  }

  const matches: { start: number; end: number }[] = [];

  keywords.forEach(keyword => {
    let startIndex = 0;
    while (true) {
      const index = text.indexOf(keyword, startIndex);
      if (index === -1) break;

      matches.push({
        start: index,
        end: index + keyword.length,
      });

      startIndex = index + 1;
    }
  });

  if (matches.length === 0) {
    return [{ text, highlighted: false }];
  }

  matches.sort((a, b) => a.start - b.start);

  const mergedMatches: { start: number; end: number }[] = [];
  let currentMatch = matches[0];

  for (let i = 1; i < matches.length; i++) {
    const nextMatch = matches[i];

    if (nextMatch.start <= currentMatch.end) {
      currentMatch = {
        start: currentMatch.start,
        end: Math.max(currentMatch.end, nextMatch.end),
      };
    } else {
      mergedMatches.push(currentMatch);
      currentMatch = nextMatch;
    }
  }
  mergedMatches.push(currentMatch);

  const result: { text: string; highlighted: boolean }[] = [];
  let lastIndex = 0;

  mergedMatches.forEach(match => {
    if (match.start > lastIndex) {
      result.push({
        text: text.substring(lastIndex, match.start),
        highlighted: false,
      });
    }

    result.push({
      text: text.substring(match.start, match.end),
      highlighted: true,
    });

    lastIndex = match.end;
  });

  if (lastIndex < text.length) {
    result.push({
      text: text.substring(lastIndex),
      highlighted: false,
    });
  }

  return result;
};
