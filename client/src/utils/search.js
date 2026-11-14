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

function mergeRanges(ranges) {
  if (ranges.length <= 1) return ranges;
  const sorted = ranges.slice().sort((a, b) => a[0] - b[0]);
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = sorted[i];
    if (curr[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }
  return merged;
}

/**
 * Finds match ranges in `text` for `query`.
 * Supports:
 *  1. Exact case-insensitive matches (e.g. "TN 15")
 *  2. Space-agnostic matches (e.g. "tn15" matching "TN 15 AB 1234")
 *  3. Multi-token matches (e.g. "TN 1234" matching and highlighting both "TN" and "1234")
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
  if (compactQuery.length > 0) {
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
    if (compactRanges.length > 0) return compactRanges;
  }

  // 3. Multi-token partial highlighting (when query has multiple words like "TN 1234" or "Karthik Activa")
  const tokens = lowerQuery.split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length > 1) {
    const tokenRanges = [];
    for (const tok of tokens) {
      let tIdx = 0;
      while (tIdx < lowerSource.length) {
        const found = lowerSource.indexOf(tok, tIdx);
        if (found === -1) break;
        tokenRanges.push([found, found + tok.length]);
        tIdx = found + tok.length;
      }
    }
    if (tokenRanges.length > 0) {
      return mergeRanges(tokenRanges);
    }
  }

  return [];
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

  const lowerQ = q.toLowerCase();
  const compactQ = lowerQ.replace(/\s+/g, '');
  const tokens = lowerQ.split(/\s+/).filter(Boolean);
  const keysToSearch = fieldFilter === 'all' ? ALL_SEARCHABLE_KEYS : [fieldFilter];

  const results = [];
  for (const customer of customers) {
    const matchedFields = [];
    let bestScore = 0;
    const tokensMatched = new Set();

    for (const key of keysToSearch) {
      const value = String(customer[key] ?? '');
      const lowerVal = value.toLowerCase();
      const compactVal = lowerVal.replace(/\s+/g, '');

      // Check full phrase match
      const exactMatch = lowerVal.includes(lowerQ);
      const compactMatch = compactQ.length > 0 && compactVal.includes(compactQ);

      if (exactMatch || compactMatch) {
        matchedFields.push(key);
        let score = key === 'vehicleNumber' ? 120 : key === 'customerName' ? 100 : 80;
        if (lowerVal.startsWith(lowerQ) || compactVal.startsWith(compactQ)) {
          score += 40; // Prefix bonus (e.g. "TN 15" at start of vehicle number)
        }
        if (score > bestScore) bestScore = score;
      }

      // Check token match
      for (const tok of tokens) {
        if (lowerVal.includes(tok)) {
          tokensMatched.add(tok);
        }
      }
    }

    // A customer qualifies if:
    // 1) Direct full phrase match in one of the fields, OR
    // 2) If query has multiple tokens (e.g. "Karthik Activa" or "TN 1234"), ALL tokens are covered across searchable fields!
    const allTokensCovered = tokens.length > 1 && tokens.every((t) => tokensMatched.has(t));

    if (bestScore > 0 || allTokensCovered) {
      if (bestScore === 0) {
        bestScore = 60;
        // Collect which fields matched any token
        for (const key of keysToSearch) {
          const lowerVal = String(customer[key] ?? '').toLowerCase();
          if (tokens.some((t) => lowerVal.includes(t)) && !matchedFields.includes(key)) {
            matchedFields.push(key);
          }
        }
      }
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
