import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import type { Datastore } from '../definitions';

const blankState: Datastore = {
  authorities: {},
  certifications: {},
  proofEntries: {},
  challengeTokens: {},
  auditLog: [],
};

const STORE_PATH = path.resolve(__dirname, '../../data/db.json');
const fileAdapter = new JSONFile<Datastore>(STORE_PATH);
const store = new Low<Datastore>(fileAdapter, blankState);

let booted = false;

export async function bootStorage(): Promise<void> {
  if (booted) return;
  await store.read();
  if (!store.data || !store.data.authorities) {
    store.data = blankState;
    await store.write();
  }
  booted = true;
  console.log('[Storage] Datastore loaded');
}

export async function getStore(): Promise<Low<Datastore>> {
  await bootStorage();
  return store;
}

export default store;
