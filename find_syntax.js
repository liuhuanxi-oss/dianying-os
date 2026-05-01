const fs = require('fs');
const code = fs.readFileSync('js/app.js', 'utf8');

// 简单的语法检查器
let inStr = false, strChar = '', escape = false;
let lineNum = 1, colNum = 0;
let parenDepth = 0, braceDepth = 0, bracketDepth = 0;
let lastChar = '', beforeLastChar = '';

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  colNum++;
  if (c === '\n') { lineNum++; colNum = 0; }
  
  if (escape) { escape = false; beforeLastChar = lastChar; lastChar = c; continue; }
  if (c === '\\') { escape = true; beforeLastChar = lastChar; lastChar = c; continue; }
  
  if (!inStr && (c === '"' || c === "'" || c === '`')) { inStr = true; strChar = c; beforeLastChar = lastChar; lastChar = c; continue; }
  if (inStr && c === strChar && beforeLastChar !== '\\') { inStr = false; beforeLastChar = lastChar; lastChar = c; continue; }
  
  if (!inStr) {
    if (c === '(') parenDepth++;
    if (c === ')') {
      parenDepth--;
      if (parenDepth < 0) {
        console.log(`ERROR: Extra closing paren at line ${lineNum}, col ${colNum}`);
        console.log(`Context: ...${code.slice(Math.max(0, i-30), i+30)}...`);
        break;
      }
    }
    if (c === '{') braceDepth++;
    if (c === '}') {
      braceDepth--;
      if (braceDepth < 0) {
        console.log(`ERROR: Extra closing brace at line ${lineNum}, col ${colNum}`);
        break;
      }
    }
    if (c === '[') bracketDepth++;
    if (c === ']') {
      bracketDepth--;
      if (bracketDepth < 0) {
        console.log(`ERROR: Extra closing bracket at line ${lineNum}, col ${colNum}`);
        break;
      }
    }
  }
  beforeLastChar = lastChar;
  lastChar = c;
}

console.log(`\nFinal balance - parens: ${parenDepth}, braces: ${braceDepth}, brackets: ${bracketDepth}`);

// 查找所有函数定义，检查语法
const funcPattern = /function\s+\w+\s*\([^)]*\)\s*\{/g;
let match;
while ((match = funcPattern.exec(code)) !== null) {
  console.log(`Found function: ${match[0].substring(0, 50)}`);
}
