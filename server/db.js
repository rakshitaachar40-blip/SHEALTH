// Tiny JSON-file database: no install, no connection string.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data.json');
export const data = { users: [], symptoms: [], reminders: [], resets: [] };

if (fs.existsSync(FILE)) Object.assign(data, JSON.parse(fs.readFileSync(FILE, 'utf8')));

export function save() {
  fs.writeFileSync(FILE + '.tmp', JSON.stringify(data, null, 2));
  fs.renameSync(FILE + '.tmp', FILE);
}
