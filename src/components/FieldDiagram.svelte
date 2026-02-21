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

  const positions: PositionInfo[] = [
    { pos: '中', label: '中', x: 150, y: 40,  colorBg: 'var(--color-pos-outfield-bg)',  colorAccent: 'var(--color-pos-outfield-accent)' },
    { pos: '左', label: '左', x: 50,  y: 80,  colorBg: 'var(--color-pos-outfield-bg)',  colorAccent: 'var(--color-pos-outfield-accent)' },
    { pos: '右', label: '右', x: 250, y: 80,  colorBg: 'var(--color-pos-outfield-bg)',  colorAccent: 'var(--color-pos-outfield-accent)' },
    { pos: '遊', label: '遊', x: 100, y: 165, colorBg: 'var(--color-pos-infield-bg)',   colorAccent: 'var(--color-pos-infield-accent)' },
    { pos: '二', label: '二', x: 200, y: 165, colorBg: 'var(--color-pos-infield-bg)',    colorAccent: 'var(--color-pos-infield-accent)' },
    { pos: '三', label: '三', x: 70,  y: 200, colorBg: 'var(--color-pos-infield-bg)',    colorAccent: 'var(--color-pos-infield-accent)' },
    { pos: '一', label: '一', x: 230, y: 200, colorBg: 'var(--color-pos-infield-bg)',    colorAccent: 'var(--color-pos-infield-accent)' },
    { pos: '投', label: '投', x: 150, y: 205, colorBg: 'var(--color-pos-pitcher-bg)',    colorAccent: 'var(--color-pos-pitcher-accent)' },
    { pos: '捕', label: '捕', x: 150, y: 290, colorBg: 'var(--color-pos-catcher-bg)',    colorAccent: 'var(--color-pos-catcher-accent)' },
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
</script>

<div class="field-diagram-wrapper">
  <svg viewBox="0 0 300 320" xmlns="http://www.w3.org/2000/svg" class="field-diagram" aria-label="守備位置図">
    <defs>
      <!-- Grass stripe pattern -->
      <pattern id="grass-stripes" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(30)">
        <rect width="12" height="12" fill="#4a8c3f" />
        <rect width="12" height="6" fill="#438537" />
      </pattern>
      <!-- Outfield grass gradient -->
      <radialGradient id="outfield-grad" cx="50%" cy="85%" r="80%">
        <stop offset="0%" stop-color="#5a9c4f" />
        <stop offset="100%" stop-color="#3d7a32" />
      </radialGradient>
      <!-- Dirt gradient -->
      <radialGradient id="dirt-grad" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="#d4a872" />
        <stop offset="100%" stop-color="#b08450" />
      </radialGradient>
      <!-- Shadow filter -->
      <filter id="marker-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3" />
      </filter>
    </defs>

    <!-- Sky / background -->
    <rect x="0" y="0" width="300" height="320" fill="#1a3d15" rx="8" />

    <!-- Outfield grass with stripes -->
    <path
      d="M 5,290 Q 5,15 150,15 Q 295,15 295,290 Z"
      fill="url(#grass-stripes)"
    />

    <!-- Outfield warning track (arc) -->
    <path
      d="M 12,285 Q 12,22 150,22 Q 288,22 288,285"
      fill="none"
      stroke="#b08450"
      stroke-width="6"
      opacity="0.5"
    />

    <!-- Foul lines -->
    <line x1="150" y1="275" x2="5"   y2="50"  stroke="white" stroke-width="1.5" opacity="0.8" />
    <line x1="150" y1="275" x2="295" y2="50"  stroke="white" stroke-width="1.5" opacity="0.8" />

    <!-- Infield dirt (diamond) -->
    <path
      d="M 150,125 L 235,205 L 150,280 L 65,205 Z"
      fill="url(#dirt-grad)"
    />

    <!-- Infield grass (cutout) -->
    <ellipse cx="150" cy="205" rx="52" ry="42" fill="url(#grass-stripes)" />

    <!-- Base paths (white chalk lines) -->
    <line x1="150" y1="275" x2="232" y2="205" stroke="white" stroke-width="2.5" />
    <line x1="232" y1="205" x2="150" y2="132" stroke="white" stroke-width="2.5" />
    <line x1="150" y1="132" x2="68"  y2="205" stroke="white" stroke-width="2.5" />
    <line x1="68"  y1="205" x2="150" y2="275" stroke="white" stroke-width="2.5" />

    <!-- Pitcher's mound -->
    <circle cx="150" cy="208" r="10" fill="#c4956a" stroke="#a07850" stroke-width="1" />
    <rect x="146" y="206" width="8" height="3" fill="white" rx="0.5" />

    <!-- Batter's boxes (left & right) -->
    <rect x="133" y="264" width="10" height="16" fill="none" stroke="white" stroke-width="1" rx="1" />
    <rect x="157" y="264" width="10" height="16" fill="none" stroke="white" stroke-width="1" rx="1" />

    <!-- Catcher's box -->
    <rect x="139" y="281" width="22" height="12" fill="none" stroke="white" stroke-width="1" rx="1" />

    <!-- Bases -->
    <!-- Home plate (pentagon) -->
    <polygon points="150,278 144,273 144,268 156,268 156,273" fill="white" />
    <!-- 1B -->
    <rect x="228" y="201" width="8" height="8" fill="white" transform="rotate(45 232 205)" />
    <!-- 2B -->
    <rect x="146" y="128" width="8" height="8" fill="white" transform="rotate(45 150 132)" />
    <!-- 3B -->
    <rect x="64"  y="201" width="8" height="8" fill="white" transform="rotate(45 68 205)" />

    <!-- Coach's boxes (small rectangles along foul lines) -->
    <rect x="58" y="240" width="8" height="14" fill="none" stroke="white" stroke-width="0.8" opacity="0.5" transform="rotate(-45 62 247)" />
    <rect x="234" y="240" width="8" height="14" fill="none" stroke="white" stroke-width="0.8" opacity="0.5" transform="rotate(45 238 247)" />

    <!-- On-deck circles -->
    <circle cx="100" cy="290" r="5" fill="none" stroke="white" stroke-width="0.8" opacity="0.5" />
    <circle cx="200" cy="290" r="5" fill="none" stroke="white" stroke-width="0.8" opacity="0.5" />

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
    width: 250px;
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
