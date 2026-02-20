import { describe, it, expect } from 'vitest';
import { parseCSV } from '../csvParser';

const VALID_HEADER = 'id,name,team,position,pa,single,double,triple,hr,bb,hbp,so';

function makeCSV(rows: string[]): string {
  return [VALID_HEADER, ...rows].join('\n');
}

describe('parseCSV', () => {
  it('parses a normal CSV into correct Player[]', () => {
    const csv = makeCSV([
      '1,田中太郎,巨人,投,500,100,30,5,20,40,5,80',
      '2,鈴木次郎,阪神,捕,400,80,20,3,15,30,4,60',
    ]);
    const { players, warnings } = parseCSV(csv);

    expect(warnings).toHaveLength(0);
    expect(players).toHaveLength(2);

    expect(players[0]).toEqual({
      id: 1,
      name: '田中太郎',
      team: '巨人',
      position: '投',
      pa: 500,
      single: 100,
      double: 30,
      triple: 5,
      hr: 20,
      bb: 40,
      hbp: 5,
      so: 80,
    });

    expect(players[1].id).toBe(2);
    expect(players[1].name).toBe('鈴木次郎');
  });

  it('returns error warning for missing/wrong header', () => {
    const csv = 'wrong,header\n1,2';
    const { players, warnings } = parseCSV(csv);

    expect(players).toHaveLength(0);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('ヘッダーが不正です');
  });

  it('skips rows with invalid numeric values and produces warning', () => {
    const csv = makeCSV([
      '1,田中太郎,巨人,投,500,100,30,5,20,40,5,80',
      'abc,鈴木次郎,阪神,捕,400,80,20,3,15,30,4,60',
    ]);
    const { players, warnings } = parseCSV(csv);

    expect(players).toHaveLength(1);
    expect(players[0].name).toBe('田中太郎');
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('数値フィールドが不正');
  });

  it('returns empty array for empty file', () => {
    const { players, warnings } = parseCSV('');
    expect(players).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });

  it('returns empty array for file with only whitespace/empty lines', () => {
    const { players, warnings } = parseCSV('  \n\n  \n');
    expect(players).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });

  it('handles BOM at start of file', () => {
    const csv = '\uFEFF' + makeCSV([
      '1,田中太郎,巨人,投,500,100,30,5,20,40,5,80',
    ]);
    const { players, warnings } = parseCSV(csv);

    expect(warnings).toHaveLength(0);
    expect(players).toHaveLength(1);
    expect(players[0].name).toBe('田中太郎');
  });

  it('handles \\r\\n line endings', () => {
    const csv = VALID_HEADER + '\r\n' + '1,田中太郎,巨人,投,500,100,30,5,20,40,5,80\r\n';
    const { players, warnings } = parseCSV(csv);

    expect(warnings).toHaveLength(0);
    expect(players).toHaveLength(1);
  });

  it('validates position is a valid value', () => {
    const csv = makeCSV([
      '1,田中太郎,巨人,X,500,100,30,5,20,40,5,80',
    ]);
    const { players, warnings } = parseCSV(csv);

    expect(players).toHaveLength(0);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('不正なポジション');
  });

  it('validates pa > 0', () => {
    const csv = makeCSV([
      '1,田中太郎,巨人,投,0,0,0,0,0,0,0,0',
    ]);
    const { players, warnings } = parseCSV(csv);

    expect(players).toHaveLength(0);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('打席数');
  });

  it('validates event sum does not exceed pa', () => {
    const csv = makeCSV([
      '1,田中太郎,巨人,投,10,5,3,2,1,1,1,1',
    ]);
    const { players, warnings } = parseCSV(csv);

    // sum = 5+3+2+1+1+1+1 = 14 > 10
    expect(players).toHaveLength(0);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('イベント合計');
  });

  it('skips rows with wrong column count', () => {
    const csv = makeCSV([
      '1,田中太郎,巨人',
      '2,鈴木次郎,阪神,捕,400,80,20,3,15,30,4,60',
    ]);
    const { players, warnings } = parseCSV(csv);

    expect(players).toHaveLength(1);
    expect(players[0].name).toBe('鈴木次郎');
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('カラム数が不正');
  });

  it('skips empty lines between data rows', () => {
    const csv = VALID_HEADER + '\n\n1,田中太郎,巨人,投,500,100,30,5,20,40,5,80\n\n2,鈴木次郎,阪神,捕,400,80,20,3,15,30,4,60\n';
    const { players, warnings } = parseCSV(csv);

    expect(warnings).toHaveLength(0);
    expect(players).toHaveLength(2);
  });

  it('rejects non-integer numeric fields', () => {
    const csv = makeCSV([
      '1,田中太郎,巨人,投,500.5,100,30,5,20,40,5,80',
    ]);
    const { players, warnings } = parseCSV(csv);

    expect(players).toHaveLength(0);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('数値フィールドが不正');
  });

  it('accepts all valid positions', () => {
    const positions = ['投', '捕', '一', '二', '三', '遊', '左', '中', '右', '指'];
    const rows = positions.map((pos, i) =>
      `${i + 1},選手${i},チーム,${pos},100,20,5,1,3,10,2,15`
    );
    const csv = makeCSV(rows);
    const { players, warnings } = parseCSV(csv);

    expect(warnings).toHaveLength(0);
    expect(players).toHaveLength(10);
  });
});
