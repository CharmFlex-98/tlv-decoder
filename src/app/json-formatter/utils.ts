// Detect duplicate keys within the same JSON object scope.
function detectDuplicates(json: string): string[] {
  type Frame = { type: 'object' | 'array'; keys?: Set<string>; expectingKey?: boolean };
  const stack: Frame[] = [];
  const duplicates = new Set<string>();

  let inString = false;
  let escaped = false;
  let strStart = -1;
  let capturingKey = false;     // true when the current string is a potential object key
  let pendingKey: string | null = null; // the key we just read, to be finalized at ':'

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];

    if (inString) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"') {
        // end of string
        const raw = json.slice(strStart, i);
        if (capturingKey) {
          // Safely unescape the key text
          try {
            pendingKey = JSON.parse('"' + raw + '"');
          } catch {
            pendingKey = raw; // fallback (shouldn't happen for valid JSON)
          }
        }
        inString = false;
        capturingKey = false;
      }
      continue;
    }

    // not in string
    if (ch === '"') {
      inString = true;
      strStart = i + 1;
      const top = stack[stack.length - 1];
      capturingKey = !!(top && top.type === 'object' && top.expectingKey);
      continue;
    }

    if (ch === '{') {
      stack.push({ type: 'object', keys: new Set<string>(), expectingKey: true });
      continue;
    }
    if (ch === '[') {
      stack.push({ type: 'array' });
      continue;
    }
    if (ch === '}') {
      stack.pop();
      continue;
    }
    if (ch === ']') {
      stack.pop();
      continue;
    }
    if (ch === ':') {
      const top = stack[stack.length - 1];
      if (top && top.type === 'object') {
        if (pendingKey !== null) {
          if (top.keys!.has(pendingKey)) duplicates.add(pendingKey);
          top.keys!.add(pendingKey);
          pendingKey = null;
        }
        top.expectingKey = false; // now expecting a value
      }
      continue;
    }
    if (ch === ',') {
      const top = stack[stack.length - 1];
      if (top && top.type === 'object') top.expectingKey = true; // next should be a key
      continue;
    }
    // ignore other chars (whitespace, numbers, braces handled above, etc.)
  }

  return Array.from(duplicates);
}


export { detectDuplicates }