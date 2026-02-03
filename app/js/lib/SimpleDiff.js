/**
 * SimpleDiff - Lightweight word-level diff utility
 * Replaces the heavier 'diff' library for simple word comparison
 */

/**
 * Compute word-level differences between two strings
 * @param {string} oldText - Original text
 * @param {string} newText - New text to compare
 * @returns {Array} Array of {value, added?, removed?} parts
 */
export function diffWords(oldText, newText) {
  const oldWords = tokenize(oldText);
  const newWords = tokenize(newText);

  // Build LCS table
  const lcs = computeLCS(oldWords, newWords);

  // Backtrack to find the diff
  return buildDiff(oldWords, newWords, lcs);
}

/**
 * Tokenize text into words, preserving whitespace
 */
function tokenize(text) {
  const tokens = [];
  const regex = /(\s+|\S+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    tokens.push(match[0]);
  }

  return tokens;
}

/**
 * Compute Longest Common Subsequence table using dynamic programming
 */
function computeLCS(oldTokens, newTokens) {
  const m = oldTokens.length;
  const n = newTokens.length;

  // Create table with dimensions [m+1][n+1]
  const table = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldTokens[i - 1] === newTokens[j - 1]) {
        table[i][j] = table[i - 1][j - 1] + 1;
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
      }
    }
  }

  return table;
}

/**
 * Determine the next operation when backtracking through LCS
 */
function getNextOp(oldTokens, newTokens, lcs, i, j) {
  if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
    return { value: oldTokens[i - 1], type: 'same', di: 1, dj: 1 };
  }
  if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
    return { value: newTokens[j - 1], type: 'added', di: 0, dj: 1 };
  }
  return { value: oldTokens[i - 1], type: 'removed', di: 1, dj: 0 };
}

/**
 * Merge consecutive operations of the same type
 */
function mergeOps(ops) {
  const result = [];
  let current = null;

  for (const op of ops) {
    if (current && current.type === op.type) {
      current.value += op.value;
    } else {
      if (current) result.push(formatPart(current));
      current = { ...op };
    }
  }

  if (current) result.push(formatPart(current));
  return result;
}

/**
 * Build diff result by backtracking through LCS table
 */
function buildDiff(oldTokens, newTokens, lcs) {
  const ops = [];
  let i = oldTokens.length;
  let j = newTokens.length;

  while (i > 0 || j > 0) {
    const op = getNextOp(oldTokens, newTokens, lcs, i, j);
    ops.push({ value: op.value, type: op.type });
    i -= op.di;
    j -= op.dj;
  }

  ops.reverse();
  return mergeOps(ops);
}

/**
 * Format a part for the result array
 */
function formatPart(part) {
  const result = { value: part.value };
  if (part.type === 'added') result.added = true;
  if (part.type === 'removed') result.removed = true;
  return result;
}

export default { diffWords };
