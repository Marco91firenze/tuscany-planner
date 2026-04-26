#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const TRANSCRIPT = process.argv[2];
const OUT_DIR = path.resolve(process.argv[3] || './extracted-images');

if (!TRANSCRIPT) {
  console.error('Usage: node extract.js <transcript.jsonl> [out-dir]');
  process.exit(1);
}

console.log('Transcript:', TRANSCRIPT);
console.log('Output dir:', OUT_DIR);

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const stream = readline.createInterface({
  input: fs.createReadStream(TRANSCRIPT),
  crlfDelay: Infinity,
});

let count = 0;
let lineNum = 0;

for await (const line of stream) {
  lineNum++;
  if (!line.trim()) continue;
  let obj;
  try {
    obj = JSON.parse(line);
  } catch {
    continue;
  }
  // Search in multiple locations:
  // - obj.message.content[]
  // - obj.attachment.queued_command.prompt[]
  // - obj.toolUseResult.content[]
  const candidates = [];
  if (Array.isArray(obj?.message?.content)) candidates.push(...obj.message.content);
  if (Array.isArray(obj?.attachment?.queued_command?.prompt)) candidates.push(...obj.attachment.queued_command.prompt);
  if (Array.isArray(obj?.attachment?.prompt)) candidates.push(...obj.attachment.prompt);
  if (Array.isArray(obj?.toolUseResult?.content)) candidates.push(...obj.toolUseResult.content);

  for (const block of candidates) {
    if (block?.type === 'image' && block?.source?.type === 'base64') {
      count++;
      const data = block.source.data;
      const mt = block.source.media_type || 'image/jpeg';
      const ext = mt.split('/')[1] || 'jpg';
      const fname = `img_${String(count).padStart(3, '0')}_line${lineNum}.${ext}`;
      const fpath = path.join(OUT_DIR, fname);
      const buf = Buffer.from(data, 'base64');
      fs.writeFileSync(fpath, buf);
      console.log(`Wrote ${fname} (${(buf.length / 1024).toFixed(1)}KB)`);
    }
  }
}

console.log(`\nDone. Extracted ${count} images.`);
