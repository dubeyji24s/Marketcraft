// Minimal JSON-file document store with atomic writes and a serialized write queue.
// Swap for Postgres/SQLite in production: every access goes through the functions below,
// so only this file needs to change.
import fs from 'node:fs';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { config } from './config.js';

const COLLECTIONS = ['users', 'lessons', 'interviews', 'challenges', 'submissions', 'certificates', 'settings', 'toolRuns', 'showcase'];

let state = null;
let writeChain = Promise.resolve();

function load() {
  if (state) return state;
  try {
    state = JSON.parse(fs.readFileSync(config.dataFile, 'utf8'));
  } catch {
    state = {};
  }
  for (const c of COLLECTIONS) state[c] ??= [];
  return state;
}

function persist() {
  const snapshot = JSON.stringify(state, null, 2);
  writeChain = writeChain.then(async () => {
    await fs.promises.mkdir(path.dirname(config.dataFile), { recursive: true });
    const tmp = `${config.dataFile}.${process.pid}.tmp`;
    await fs.promises.writeFile(tmp, snapshot);
    await fs.promises.rename(tmp, config.dataFile);
  });
  return writeChain;
}

export const db = {
  all(collection, filter = () => true) {
    return load()[collection].filter(filter);
  },
  find(collection, predicate) {
    return load()[collection].find(predicate) ?? null;
  },
  get(collection, id) {
    return load()[collection].find((d) => d.id === id) ?? null;
  },
  async insert(collection, doc) {
    const now = new Date().toISOString();
    const record = { id: nanoid(12), createdAt: now, updatedAt: now, ...doc };
    load()[collection].push(record);
    await persist();
    return record;
  },
  async update(collection, id, patch) {
    const doc = this.get(collection, id);
    if (!doc) return null;
    Object.assign(doc, patch, { updatedAt: new Date().toISOString() });
    await persist();
    return doc;
  },
  async remove(collection, id) {
    const list = load()[collection];
    const i = list.findIndex((d) => d.id === id);
    if (i === -1) return false;
    list.splice(i, 1);
    await persist();
    return true;
  },
  flush: () => writeChain,
  // test helper
  _reset() {
    state = {};
    for (const c of COLLECTIONS) state[c] = [];
  },
};
