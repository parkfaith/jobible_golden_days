import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../client/src/data');

/**
 * JSON 데이터 파일을 읽어 배열로 반환합니다.
 * @param {string} filename - 파일명 (예: 'bible.json')
 * @returns {Promise<Array>}
 */
export async function readJSON(filename) {
  const filePath = resolve(DATA_DIR, filename);
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * 배열을 JSON 파일에 저장합니다 (2칸 들여쓰기 + 후행 줄바꿈).
 * @param {string} filename - 파일명
 * @param {Array} data - 저장할 배열
 */
export async function writeJSON(filename, data) {
  const filePath = resolve(DATA_DIR, filename);
  const json = JSON.stringify(data, null, 2) + '\n';
  await writeFile(filePath, json, 'utf-8');
}
