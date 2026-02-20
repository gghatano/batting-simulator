import { describe, it, expect } from 'vitest';
import { convertToExportUrl } from '../spreadsheetLoader';

describe('convertToExportUrl', () => {
  const SHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms';

  it('converts /edit#gid=0 URL to export URL', () => {
    const input = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=0`;
    expect(convertToExportUrl(input)).toBe(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
    );
  });

  it('converts /edit?usp=sharing URL to export URL', () => {
    const input = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing`;
    expect(convertToExportUrl(input)).toBe(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
    );
  });

  it('converts bare URL (no trailing path) to export URL', () => {
    const input = `https://docs.google.com/spreadsheets/d/${SHEET_ID}`;
    expect(convertToExportUrl(input)).toBe(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
    );
  });

  it('returns already-valid export URL unchanged', () => {
    const input = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
    expect(convertToExportUrl(input)).toBe(input);
  });

  it('throws for a completely invalid URL', () => {
    expect(() => convertToExportUrl('https://example.com')).toThrow(
      '有効な Google Spreadsheet の URL ではありません',
    );
  });

  it('throws for an empty string', () => {
    expect(() => convertToExportUrl('')).toThrow(
      '有効な Google Spreadsheet の URL ではありません',
    );
  });

  it('throws for a non-Google Sheets URL', () => {
    expect(() =>
      convertToExportUrl('https://docs.google.com/document/d/abc/edit'),
    ).toThrow('有効な Google Spreadsheet の URL ではありません');
  });

  it('trims whitespace from the URL', () => {
    const input = `  https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit  `;
    expect(convertToExportUrl(input)).toBe(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
    );
  });
});
