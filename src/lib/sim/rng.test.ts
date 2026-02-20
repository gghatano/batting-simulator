import { describe, it, expect } from 'vitest';
import { createRng } from './rng';

describe('createRng', () => {
  it('同一 seed → 100回呼び出した結果が完全一致', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);

    const results1: number[] = [];
    const results2: number[] = [];

    for (let i = 0; i < 100; i++) {
      results1.push(rng1());
      results2.push(rng2());
    }

    expect(results1).toEqual(results2);
  });

  it('異なる seed → 結果が異なる', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(99);

    const results1: number[] = [];
    const results2: number[] = [];

    for (let i = 0; i < 10; i++) {
      results1.push(rng1());
      results2.push(rng2());
    }

    expect(results1).not.toEqual(results2);
  });

  it('10000回呼び出して全て 0 <= x < 1 の範囲内', () => {
    const rng = createRng(123);

    for (let i = 0; i < 10000; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('分布の偏りチェック（0.5未満と0.5以上がおおよそ半々）', () => {
    const rng = createRng(456);
    const n = 10000;
    let belowHalf = 0;

    for (let i = 0; i < n; i++) {
      if (rng() < 0.5) {
        belowHalf++;
      }
    }

    const ratio = belowHalf / n;
    // Expect roughly 50% ± 5%
    expect(ratio).toBeGreaterThan(0.45);
    expect(ratio).toBeLessThan(0.55);
  });

  it('seed 未指定時でも正常に動作する', () => {
    const rng = createRng();
    const value = rng();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });

  it('seed 未指定時は毎回異なるシーケンスを生成する（高確率）', () => {
    const rng1 = createRng();
    const rng2 = createRng();

    // 最初の値が異なることを期待（同一になる確率は極めて低い）
    const v1 = rng1();
    const v2 = rng2();
    expect(v1).not.toEqual(v2);
  });
});
