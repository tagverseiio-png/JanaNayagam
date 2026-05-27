const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\prade\\.gemini\\antigravity\\brain\\b913e00b-9ad3-4beb-a5bf-20c986f4f19c\\.system_generated\\logs\\transcript.jsonl';

try {
  if (fs.existsSync(logPath)) {
    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n');
    console.log(`Total lines: ${lines.length}`);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('const districts = [') && line.includes('coordinates')) {
        console.log(`Found on line ${i + 1}:`);
        const start = line.indexOf('const districts = [');
        console.log(line.substring(start, start + 8000));
        break;
      }
    }
  } else {
    console.log(`Log path does not exist: ${logPath}`);
  }
} catch (err) {
  console.error(err);
}
