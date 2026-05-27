import os

log_path = r'C:\Users\prade\.gemini\antigravity\brain\b913e00b-9ad3-4beb-a5bf-20c986f4f19c\.system_generated\logs\transcript.jsonl'

try:
    if os.path.exists(log_path):
        with open(log_path, 'r', encoding='utf-8') as f:
            for idx, line in enumerate(f):
                if 'const districts = [' in line and 'coordinates' in line:
                    print(f"Found on line {idx + 1}:")
                    # print part of the matching line to locate coordinates
                    start = line.find('const districts = [')
                    print(line[start:start+6000])
                    break
    else:
        print(f"Log path does not exist: {log_path}")
except Exception as e:
    print(f"Error: {e}")
