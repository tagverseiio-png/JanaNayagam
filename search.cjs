const fs = require('fs');

const logPath = 'C:\\Users\\prade\\.gemini\\antigravity\\brain\\b913e00b-9ad3-4beb-a5bf-20c986f4f19c\\.system_generated\\logs\\transcript.jsonl';

try {
  if (fs.existsSync(logPath)) {
    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n');
    console.log(`Total lines: ${lines.length}`);
    
    // Scan backwards from the end to find any match
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.includes('Live District Radar')) {
        console.log(`Found on line ${i + 1} (length ${line.length}):`);
        console.log(line.substring(0, 4000));
        console.log('\n---END CHUNK---\n');
      }
    }
  } else {
    console.log(`Log path does not exist`);
  }
} catch (err) {
  console.error(err);
}
