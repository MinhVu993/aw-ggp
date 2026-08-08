import fs from 'fs';
import { execSync } from 'child_process';

try {
  const pbPath = 'C:\\Users\\vu.huynh\\.gemini\\antigravity\\conversations\\1245ddb6-9a8f-4476-8657-f3176e823bf1.pb';
  if (fs.existsSync(pbPath)) {
    const buf = fs.readFileSync(pbPath);
    const hex = buf.subarray(0, 50).toString('hex');
    fs.writeFileSync('recovery_log.txt', `First 50 bytes hex: ${hex}`);
  } else {
    fs.writeFileSync('recovery_log.txt', 'Protobuf file not found: ' + pbPath);
  }
} catch (e) {
  fs.writeFileSync('recovery_log.txt', 'Error: ' + e.message + '\n' + e.stack);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // basePath: '/ps/fac',
  /* config options here */
};

export default nextConfig;
