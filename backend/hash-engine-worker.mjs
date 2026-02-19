// Hash computation worker — standalone ESM process
// Uses @provablehq/sdk WASM for BHP256::hash_to_field
import { Account } from '@provablehq/sdk';

const raw = process.argv[2];
if (!raw) {
  console.error('Usage: node hash-engine-worker.mjs <field_value>');
  process.exit(1);
}

const normalized = raw.endsWith('field') ? raw : `${raw}field`;

try {
  const sdk = await import('@provablehq/sdk');

  let result = null;

  if (sdk.BHP256 && sdk.Field) {
    const fieldVal = sdk.Field.fromString(normalized);
    const bits = fieldVal.toBitsLe();
    const engine = new sdk.BHP256();
    result = engine.hash(bits)?.toString();
  }

  if (result) {
    console.log(result);
  } else {
    console.error('Computation returned null');
    process.exit(1);
  }
} catch (err) {
  console.error(`Hash computation failed: ${err.message}`);
  process.exit(1);
}
