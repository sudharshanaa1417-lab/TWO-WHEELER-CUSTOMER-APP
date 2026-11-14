export const SEARCH_FIELDS = [
  { key: 'all', label: 'All Fields' },
  { key: 'vehicleNumber', label: 'Vehicle No' },
  { key: 'customerName', label: 'Name' },
  { key: 'mobileNumber', label: 'Mobile' },
  { key: 'address', label: 'Address' },
  { key: 'vehicleModel', label: 'Model' }
];

const ALL_SEARCHABLE_KEYS = [
  'vehicleNumber',
  'customerName',
  'mobileNumber',
  'vehicleModel',
  'address',
  'remarks'
];

/**
 * Finds match ranges in `text` for `query`.
 * Supports both exact case-insensitive matches (e.g. "TN 15")
 * and space-agnostic matches (e.g. "tn15" matching "TN 15 AB 1234").
 */
export function findMatchRanges(text, query) {
  const source = String(text ?? '');
  const q = String(query ?? '').trim();
  if (!source || !q) return [];

  const lowerSource = source.toLowerCase();
  const lowerQuery = q.toLowerCase();

  // 1. Direct case-insensitive substring occurrences
  const directRanges = [];
  let startIndex = 0;
  while (startIndex < lowerSource.length) {
    const foundAt = lowerSource.indexOf(lowerQuery, startIndex);
    if (foundAt === -1) break;
    directRanges.push([foundAt, foundAt + lowerQuery.length]);
    startIndex = foundAt + lowerQuery.length;
  }
  if (directRanges.length > 0) return directRanges;

  // 2. Space-tolerant matching (e.g. "tn15" -> "TN 15", "987654" -> "98765 43210")
  const compactQuery = lowerQuery.replace(/\s+/g, '');
  if (!compactQuery) return [];

  const charMap = [];
  let compactSource = '';
  for (let i = 0; i < lowerSource.length; i++) {
    if (!/\s/.test(lowerSource[i])) {
      charMap.push(i);
      compactSource += lowerSource[i];
    }
  }

  const compactRanges = [];
  let cIdx = 0;
  while (cIdx < compactSource.length) {
    const hit = compactSource.indexOf(compactQuery, cIdx);
    if (hit === -1) break;
    const origStart = charMap[hit];
    const origEnd = charMap[hit + compactQuery.length - 1] + 1;
    compactRanges.push([origStart, origEnd]);
    cIdx = hit + compactQuery.length;
  }
  return compactRanges;
}

export function getHighlightSegments(text, query) {
  const source = String(text ?? '');
  const ranges = findMatchRanges(source, query);
  if (ranges.length === 0) {
    return [{ text: source, match: false }];
  }

  const segments = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) {
      segments.push({ text: source.slice(cursor, start), match: false });
    }
    segments.push({ text: source.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < source.length) {
    segments.push({ text: source.slice(cursor), match: false });
  }
  return segments;
}

export function smartSearchCustomers(customers, query, fieldFilter = 'all') {
  const q = String(query ?? '').trim();
  if (!q) return [];

  const keysToSearch =
    fieldFilter === 'all' ? ALL_SEARCHABLE_KEYS : [fieldFilter];

  const results = [];
  for (const customer of customers) {
    const matchedFields = [];
    let bestScore = 0;

    for (const key of keysToSearch) {
      const value = String(customer[key] ?? '');
      const ranges = findMatchRanges(value, q);
      if (ranges.length > 0) {
        matchedFields.push(key);
        let score = key === 'vehicleNumber' ? 100 : key === 'customerName' ? 80 : 60;
        if (ranges[0][0] === 0) score += 30; // Prefix match boost (e.g. "TN 15" at start)
        if (score > bestScore) bestScore = score;
      }
    }

    if (matchedFields.length > 0) {
      results.push({ customer, matchedFields, score: bestScore });
    }
  }

  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return String(a.customer.vehicleNumber).localeCompare(String(b.customer.vehicleNumber));
  });
}

export function extractTopPrefixes(customers, limit = 5) {
  const counts = new Map();
  for (const c of customers) {
    const parts = String(c.vehicleNumber || '')
      .trim()
      .toUpperCase()
      .split(/\s+/);
    if (parts.length >= 2) {
      const prefix = `${parts[0]} ${parts[1]}`;
      counts.set(prefix, (counts.get(prefix) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([prefix, count]) => ({ prefix, count }));
}
