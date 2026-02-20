// ---------------------------------------------------------------------------
// spreadsheetLoader.ts — Load player data from a public Google Spreadsheet
// ---------------------------------------------------------------------------

import { parseCSV } from './csvParser';
import type { Player } from './models';

/** Result of loading from a spreadsheet */
export interface LoadSpreadsheetResult {
  players: Player[];
  warnings: string[];
}

/**
 * Convert a Google Sheets URL to a CSV export URL.
 *
 * Accepted input formats:
 *   - https://docs.google.com/spreadsheets/d/{ID}/edit...
 *   - https://docs.google.com/spreadsheets/d/{ID}/export?format=csv (passthrough)
 *   - https://docs.google.com/spreadsheets/d/{ID} (no trailing path)
 *
 * @throws Error if the URL is not a valid Google Sheets URL
 */
export function convertToExportUrl(url: string): string {
  const trimmed = url.trim();

  // Match Google Sheets URL pattern and extract the spreadsheet ID
  const match = trimmed.match(
    /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,
  );

  if (!match) {
    throw new Error(
      '有効な Google Spreadsheet の URL ではありません。' +
        '「https://docs.google.com/spreadsheets/d/...」形式の URL を入力してください。',
    );
  }

  const sheetId = match[1];

  // If it's already an export URL with format=csv, return as-is
  if (/\/export\b/.test(trimmed) && /[?&]format=csv/.test(trimmed)) {
    return trimmed;
  }

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
}

/**
 * Load player data from a public Google Spreadsheet.
 *
 * 1. Converts the URL to a CSV export URL
 * 2. Fetches the CSV via the network
 * 3. Parses the CSV using parseCSV
 *
 * The spreadsheet must be publicly accessible ("ウェブに公開" or
 * "リンクを知っている全員がアクセス可能").
 */
export async function loadFromSpreadsheet(
  url: string,
): Promise<LoadSpreadsheetResult> {
  const exportUrl = convertToExportUrl(url);

  let response: Response;
  try {
    response = await fetch(exportUrl);
  } catch (_err: unknown) {
    throw new Error(
      'スプレッドシートの取得に失敗しました。' +
        'スプレッドシートが公開設定になっているか確認してください。',
    );
  }

  if (!response.ok) {
    throw new Error(
      `スプレッドシートの取得に失敗しました (HTTP ${response.status})。` +
        'スプレッドシートが公開設定になっているか確認してください。',
    );
  }

  const text = await response.text();
  return parseCSV(text);
}
