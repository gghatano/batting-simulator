// ---------------------------------------------------------------------------
// csvParser.ts — Parse CSV text into Player[] with validation
// ---------------------------------------------------------------------------

import type { Player, Position } from './models';

/** Expected CSV header columns in order */
const EXPECTED_HEADERS = [
  'id', 'name', 'team', 'position', 'pa',
  'single', 'double', 'triple', 'hr', 'bb', 'hbp', 'so',
] as const;

/** Valid position values */
const VALID_POSITIONS: ReadonlySet<string> = new Set<string>([
  '投', '捕', '一', '二', '三', '遊', '左', '中', '右', '指',
]);

/** Result of parsing a CSV file */
export interface ParseCSVResult {
  players: Player[];
  warnings: string[];
}

/**
 * Parse CSV text into an array of Player objects.
 *
 * - Handles BOM (U+FEFF) at the start of the text
 * - Handles both \r\n and \n line endings
 * - Skips empty lines
 * - Validates header row
 * - Validates each data row and skips invalid rows with warnings
 */
export function parseCSV(text: string): ParseCSVResult {
  const warnings: string[] = [];
  const players: Player[] = [];

  // Strip BOM if present
  let cleaned = text;
  if (cleaned.charCodeAt(0) === 0xFEFF) {
    cleaned = cleaned.slice(1);
  }

  // Normalize line endings and split
  const lines = cleaned.replace(/\r\n/g, '\n').split('\n');

  // Filter out empty lines but keep track of original line numbers
  const nonEmptyLines: { line: string; lineNum: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed !== '') {
      nonEmptyLines.push({ line: trimmed, lineNum: i + 1 });
    }
  }

  if (nonEmptyLines.length === 0) {
    return { players: [], warnings: [] };
  }

  // Validate header
  const headerCols = nonEmptyLines[0].line.split(',').map(c => c.trim().toLowerCase());
  const expectedStr = EXPECTED_HEADERS.join(',');
  const actualStr = headerCols.join(',');

  if (actualStr !== expectedStr) {
    return {
      players: [],
      warnings: [`ヘッダーが不正です。期待: ${expectedStr} / 実際: ${actualStr}`],
    };
  }

  // Parse data rows
  for (let i = 1; i < nonEmptyLines.length; i++) {
    const { line, lineNum } = nonEmptyLines[i];
    const cols = line.split(',');

    if (cols.length !== EXPECTED_HEADERS.length) {
      warnings.push(`行${lineNum}: カラム数が不正です (${cols.length}列、期待: ${EXPECTED_HEADERS.length}列)`);
      continue;
    }

    const [idStr, name, team, position, paStr, singleStr, doubleStr, tripleStr, hrStr, bbStr, hbpStr, soStr] = cols.map(c => c.trim());

    // Parse numeric fields
    const id = Number(idStr);
    const pa = Number(paStr);
    const single = Number(singleStr);
    const double_ = Number(doubleStr);
    const triple = Number(tripleStr);
    const hr = Number(hrStr);
    const bb = Number(bbStr);
    const hbp = Number(hbpStr);
    const so = Number(soStr);

    const numericFields = [id, pa, single, double_, triple, hr, bb, hbp, so];
    if (numericFields.some(n => isNaN(n) || !Number.isInteger(n))) {
      warnings.push(`行${lineNum}: 数値フィールドが不正です`);
      continue;
    }

    // Validate pa > 0
    if (pa <= 0) {
      warnings.push(`行${lineNum}: 打席数(pa)は1以上である必要があります`);
      continue;
    }

    // Validate sum <= pa
    const eventSum = single + double_ + triple + hr + bb + hbp + so;
    if (eventSum > pa) {
      warnings.push(`行${lineNum}: イベント合計(${eventSum})が打席数(${pa})を超えています`);
      continue;
    }

    // Validate position
    if (!VALID_POSITIONS.has(position)) {
      warnings.push(`行${lineNum}: 不正なポジション "${position}"`);
      continue;
    }

    // Validate name and team are non-empty
    if (name === '' || team === '') {
      warnings.push(`行${lineNum}: 名前またはチーム名が空です`);
      continue;
    }

    players.push({
      id,
      name,
      team,
      position: position as Position,
      pa,
      single,
      double: double_,
      triple,
      hr,
      bb,
      hbp,
      so,
    });
  }

  return { players, warnings };
}
