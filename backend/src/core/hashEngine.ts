import { execFile } from 'child_process';
import path from 'path';

const WORKER_SCRIPT = path.resolve(__dirname, '../../hash-engine-worker.mjs');
const memo = new Map<string, string>();
let engineOnline = false;

export async function bootHashEngine(): Promise<boolean> {
  try {
    const probe = await digestField('1field');
    engineOnline = probe !== null;
    console.log(`[HashEngine] Ready: ${engineOnline}`);
    return engineOnline;
  } catch {
    console.warn('[HashEngine] Boot failed — fallback mode');
    engineOnline = false;
    return false;
  }
}

export async function digestField(raw: string): Promise<string | null> {
  const normalized = raw.endsWith('field') ? raw : `${raw}field`;

  if (memo.has(normalized)) return memo.get(normalized)!;

  return new Promise((resolve) => {
    execFile('node', [WORKER_SCRIPT, normalized], { timeout: 30000 }, (err, stdout) => {
      if (err) {
        console.error(`[HashEngine] Error: ${err.message}`);
        resolve(null);
        return;
      }

      const output = stdout.trim();
      if (output.endsWith('field')) {
        memo.set(normalized, output);
        resolve(output);
      } else {
        console.warn(`[HashEngine] Unexpected: ${output}`);
        resolve(null);
      }
    });
  });
}

export function isHashEngineReady(): boolean {
  return engineOnline;
}
