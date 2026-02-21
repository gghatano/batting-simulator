<script lang="ts">
  import { lineupStore } from '../stores/lineup';
  import type { Position, Player } from '../lib/models';

  /** Field positions to display (excluding DH) */
  type FieldPosition = Exclude<Position, '指'>;

  interface PositionInfo {
    pos: FieldPosition;
    label: string;
    x: number;
    y: number;
    colorBg: string;
    colorAccent: string;
  }

  /**
   * Geometry:
   * - Home plate at (150, 280)
   * - 90° sector (fan) with radius R=200, opening upward
   * - Foul lines at ±45° from vertical
   * - Diamond (square rotated 45°) with side = R/2 = 100
   *   - half-diagonal = 100 * √2 / 2 ≈ 70.7
   *   - Home (150, 280), 1B (221, 209), 2B (150, 139), 3B (79, 209)
   */
  const R = 200;
  const HOME_X = 150;
  const HOME_Y = 280;
  const HALF_DIAG = Math.round((R / 2) * Math.SQRT2 / 2); // ~70.7 → 71

  const positions: PositionInfo[] = [
    { pos: '中', label: '中', x: 150, y: 105, colorBg: 'var(--color-pos-outfield-bg)',  colorAccent: 'var(--color-pos-outfield-accent)' },
    { pos: '左', label: '左', x: 60,  y: 155, colorBg: 'var(--color-pos-outfield-bg)',  colorAccent: 'var(--color-pos-outfield-accent)' },
    { pos: '右', label: '右', x: 240, y: 155, colorBg: 'var(--color-pos-outfield-bg)',  colorAccent: 'var(--color-pos-outfield-accent)' },
    { pos: '遊', label: '遊', x: 120, y: 168, colorBg: 'var(--color-pos-infield-bg)',   colorAccent: 'var(--color-pos-infield-accent)' },
    { pos: '二', label: '二', x: 180, y: 168, colorBg: 'var(--color-pos-infield-bg)',    colorAccent: 'var(--color-pos-infield-accent)' },
    { pos: '三', label: '三', x: 82,  y: 210, colorBg: 'var(--color-pos-infield-bg)',    colorAccent: 'var(--color-pos-infield-accent)' },
    { pos: '一', label: '一', x: 218, y: 210, colorBg: 'var(--color-pos-infield-bg)',    colorAccent: 'var(--color-pos-infield-accent)' },
    { pos: '投', label: '投', x: 150, y: 225, colorBg: 'var(--color-pos-pitcher-bg)',    colorAccent: 'var(--color-pos-pitcher-accent)' },
    { pos: '捕', label: '捕', x: 150, y: 298, colorBg: 'var(--color-pos-catcher-bg)',    colorAccent: 'var(--color-pos-catcher-accent)' },
  ];

  /** Map of position -> first player found in lineup with that position */
  $: filledPositions = (() => {
    const map = new Map<FieldPosition, Player>();
    for (const slot of $lineupStore) {
      if (slot && slot.position !== '指' && !map.has(slot.position as FieldPosition)) {
        map.set(slot.position as FieldPosition, slot);
      }
    }
    return map;
  })();

  /** Check if any player in the lineup is a DH */
  $: dhPlayer = (() => {
    for (const slot of $lineupStore) {
      if (slot && slot.position === '指') return slot;
    }
    return null;
  })();

  /** Truncate name for display */
  function truncName(name: string, max: number = 4): string {
    return name.length > max ? name.slice(0, max) : name;
  }

  /* Sector arc endpoints (±45° from vertical, radius R) */
  const sin45 = Math.SQRT2 / 2; // ≈ 0.7071
  const arcLeftX = Math.round(HOME_X - R * sin45);  // 150 - 141 = 9
  const arcLeftY = Math.round(HOME_Y - R * sin45);  // 280 - 141 = 139
  const arcRightX = Math.round(HOME_X + R * sin45); // 150 + 141 = 291
  const arcRightY = arcLeftY;                        // 139

  /* Diamond vertices (square side = R/2, rotated 45°) */
  const b1X = HOME_X + HALF_DIAG;  // 1B: 221
  const b1Y = HOME_Y - HALF_DIAG;  // 209
  const b2X = HOME_X;              // 2B: 150
  const b2Y = HOME_Y - 2 * HALF_DIAG; // 138
  const b3X = HOME_X - HALF_DIAG;  // 3B: 79
  const b3Y = HOME_Y - HALF_DIAG;  // 209
</script>

<div class="field-diagram-wrapper">
  <svg viewBox="0 68 300 252" xmlns="http://www.w3.org/2000/svg" class="field-diagram" aria-label="守備位置図">
    <defs>
      <!-- Grass stripe pattern -->
      <pattern id="grass-stripes" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(30)">
        <rect width="12" height="12" fill="#4a8c3f" />
        <rect width="12" height="6" fill="#438537" />
      </pattern>
      <!-- Dirt gradient for infield -->
      <radialGradient id="dirt-grad" cx="50%" cy="70%" r="60%">
        <stop offset="0%" stop-color="#d4a872" />
        <stop offset="100%" stop-color="#b08450" />
      </radialGradient>
      <!-- Shadow filter for markers -->
      <filter id="marker-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3" />
      </filter>
      <!-- Clip path for the sector shape -->
      <clipPath id="sector-clip">
        <path d="M {HOME_X} {HOME_Y} L {arcLeftX} {arcLeftY} A {R} {R} 0 0 1 {arcRightX} {arcRightY} Z" />
      </clipPath>
    </defs>

    <!-- Dark background -->
    <rect x="0" y="0" width="300" height="320" fill="#1a2a16" rx="8" />

    <!-- 90° sector: outfield grass with stripes -->
    <path
      d="M {HOME_X} {HOME_Y} L {arcLeftX} {arcLeftY} A {R} {R} 0 0 1 {arcRightX} {arcRightY} Z"
      fill="url(#grass-stripes)"
    />

    <!-- Warning track arc (near the outer edge) -->
    <path
      d="M {arcLeftX + 8} {arcLeftY + 5} A {R - 10} {R - 10} 0 0 1 {arcRightX - 8} {arcRightY + 5}"
      fill="none"
      stroke="#b08450"
      stroke-width="5"
      opacity="0.4"
      clip-path="url(#sector-clip)"
    />

    <!-- Foul lines (white) -->
    <line x1={HOME_X} y1={HOME_Y} x2={arcLeftX} y2={arcLeftY} stroke="white" stroke-width="1.5" opacity="0.8" />
    <line x1={HOME_X} y1={HOME_Y} x2={arcRightX} y2={arcRightY} stroke="white" stroke-width="1.5" opacity="0.8" />

    <!-- Infield diamond (brown dirt) -->
    <path
      d="M {HOME_X} {HOME_Y} L {b1X} {b1Y} L {b2X} {b2Y} L {b3X} {b3Y} Z"
      fill="url(#dirt-grad)"
    />

    <!-- Infield grass cutout (ellipse inside diamond) -->
    <ellipse cx={HOME_X} cy={(HOME_Y + b2Y) / 2} rx="45" ry="35" fill="url(#grass-stripes)" />

    <!-- Base paths (white lines) -->
    <line x1={HOME_X} y1={HOME_Y} x2={b1X} y2={b1Y} stroke="white" stroke-width="2" />
    <line x1={b1X} y1={b1Y} x2={b2X} y2={b2Y} stroke="white" stroke-width="2" />
    <line x1={b2X} y1={b2Y} x2={b3X} y2={b3Y} stroke="white" stroke-width="2" />
    <line x1={b3X} y1={b3Y} x2={HOME_X} y2={HOME_Y} stroke="white" stroke-width="2" />

    <!-- Pitcher's mound -->
    <circle cx={HOME_X} cy={(HOME_Y + b2Y) / 2 + 10} r="8" fill="#c4956a" stroke="#a07850" stroke-width="1" />
    <rect x={HOME_X - 4} y={(HOME_Y + b2Y) / 2 + 8} width="8" height="3" fill="white" rx="0.5" />

    <!-- Home plate (pentagon) -->
    <polygon points="{HOME_X},{HOME_Y - 2} {HOME_X - 5},{HOME_Y - 7} {HOME_X - 5},{HOME_Y - 11} {HOME_X + 5},{HOME_Y - 11} {HOME_X + 5},{HOME_Y - 7}" fill="white" />

    <!-- 1B -->
    <rect x={b1X - 4} y={b1Y - 4} width="8" height="8" fill="white" transform="rotate(45 {b1X} {b1Y})" />
    <!-- 2B -->
    <rect x={b2X - 4} y={b2Y - 4} width="8" height="8" fill="white" transform="rotate(45 {b2X} {b2Y})" />
    <!-- 3B -->
    <rect x={b3X - 4} y={b3Y - 4} width="8" height="8" fill="white" transform="rotate(45 {b3X} {b3Y})" />

    <!-- Batter's boxes -->
    <rect x={HOME_X - 15} y={HOME_Y - 14} width="9" height="14" fill="none" stroke="white" stroke-width="0.8" rx="1" />
    <rect x={HOME_X + 6} y={HOME_Y - 14} width="9" height="14" fill="none" stroke="white" stroke-width="0.8" rx="1" />

    <!-- Position markers -->
    {#each positions as p}
      {@const player = filledPositions.get(p.pos)}
      <g class="position-marker" filter="url(#marker-shadow)">
        {#if player}
          <!-- Filled position -->
          <circle cx={p.x} cy={p.y} r="13" fill={p.colorAccent} stroke="white" stroke-width="2" />
          <text x={p.x} y={p.y + 1} text-anchor="middle" dominant-baseline="central" fill="white" font-size="10" font-weight="bold" font-family="sans-serif">
            {p.label}
          </text>
          <!-- Name with background pill -->
          <rect x={p.x - 24} y={p.y + 15} width="48" height="13" rx="6.5" fill="rgba(0,0,0,0.6)" />
          <text x={p.x} y={p.y + 23} text-anchor="middle" fill="white" font-size="8" font-weight="600" font-family="sans-serif">
            {truncName(player.name)}
          </text>
        {:else}
          <!-- Empty position -->
          <circle cx={p.x} cy={p.y} r="13" fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-dasharray="3,2" />
          <text x={p.x} y={p.y + 1} text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.5)" font-size="10" font-family="sans-serif">
            {p.label}
          </text>
        {/if}
      </g>
    {/each}
  </svg>

  <!-- DH indicator -->
  {#if dhPlayer}
    <div class="dh-indicator">
      <span class="dh-badge">DH</span>
      <span class="dh-name">{truncName(dhPlayer.name, 6)}</span>
    </div>
  {/if}
</div>

<style>
  .field-diagram-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    margin: var(--space-sm) 0;
  }

  .field-diagram {
    width: 200px;
    height: auto;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
  }

  .position-marker {
    transition: opacity var(--transition-fast);
  }

  .dh-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: 2px var(--space-sm);
    border: 1px solid var(--color-pos-dh-accent);
    border-radius: var(--radius-sm);
    background: var(--color-pos-dh-bg);
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  .dh-badge {
    font-weight: bold;
    color: var(--color-pos-dh-accent);
  }

  .dh-name {
    color: var(--color-text);
  }
</style>
