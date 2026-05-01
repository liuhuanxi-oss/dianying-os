const fs = require('fs');
const code = fs.readFileSync('js/app.js', 'utf8');

let inStr = false, strChar = '', escape = false;
let lineNum = 1;
let braceStack = []; // 记录行号的栈

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  if (c === '\n') lineNum++;
  
  if (escape) { escape = false; continue; }
  if (c === '\\') { escape = true; continue; }
  
  if (!inStr && (c === '"' || c === "'" || c === '`')) { inStr = true; strChar = c; continue; }
  if (inStr && c === strChar && code[i-1] !== '\\') { inStr = false; continue; }
  
  if (!inStr) {
    if (c === '{') braceStack.push(lineNum);
    if (c === '}') {
      if (braceStack.length === 0) {
        console.log(`ERROR: Extra } at line ${lineNum}`);
      } else {
        const openLine = braceStack.pop();
        console.log(`Pair: { at line ${openLine} matches } at line ${lineNum}`);
      }
    }
  }
}

if (braceStack.length > 0) {
  console.log(`\nUnclosed braces at lines: ${braceStack.join(', ')}`);
}
