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
  <svg viewBox="0 0 300 310" xmlns="http://www.w3.org/2000/svg" class="field-diagram" aria-label="守備位置図">
    <!-- Outfield grass (large arc) -->
    <path
      d="M 10,280 Q 10,10 150,10 Q 290,10 290,280 Z"
      fill="#4a8c3f"
      stroke="#3a7030"
      stroke-width="2"
    />

    <!-- Infield dirt -->
    <path
      d="M 150,120 L 230,200 L 150,275 L 70,200 Z"
      fill="#c4956a"
      stroke="#a07850"
      stroke-width="1.5"
    />

    <!-- Infield grass (inner diamond area) -->
    <ellipse cx="150" cy="200" rx="55" ry="45" fill="#5a9c4f" />

    <!-- Pitcher's mound -->
    <circle cx="150" cy="205" r="8" fill="#c4956a" stroke="#a07850" stroke-width="1" />

    <!-- Base paths (white lines) -->
    <line x1="150" y1="270" x2="230" y2="200" stroke="white" stroke-width="2" />
    <line x1="230" y1="200" x2="150" y2="130" stroke="white" stroke-width="2" />
    <line x1="150" y1="130" x2="70"  y2="200" stroke="white" stroke-width="2" />
    <line x1="70"  y1="200" x2="150" y2="270" stroke="white" stroke-width="2" />

    <!-- Bases -->
    <!-- Home plate -->
    <polygon points="150,275 145,270 147,265 153,265 155,270" fill="white" />
    <!-- 1B -->
    <rect x="225" y="195" width="10" height="10" fill="white" transform="rotate(45 230 200)" />
    <!-- 2B -->
    <rect x="145" y="125" width="10" height="10" fill="white" transform="rotate(45 150 130)" />
    <!-- 3B -->
    <rect x="65"  y="195" width="10" height="10" fill="white" transform="rotate(45 70 200)" />

    <!-- Position markers -->
    {#each positions as p}
      {@const player = filledPositions.get(p.pos)}
      <g class="position-marker">
        {#if player}
          <!-- Filled position -->
          <circle cx={p.x} cy={p.y} r="12" fill={p.colorAccent} stroke="white" stroke-width="1.5" opacity="0.9" />
          <text x={p.x} y={p.y + 1} text-anchor="middle" dominant-baseline="central" fill="white" font-size="10" font-weight="bold">
            {p.label}
          </text>
          <text x={p.x} y={p.y + 22} text-anchor="middle" fill="white" font-size="8" font-weight="bold" stroke="#333" stroke-width="0.3">
            {truncName(player.name)}
          </text>
        {:else}
          <!-- Empty position -->
          <circle cx={p.x} cy={p.y} r="12" fill="none" stroke="var(--color-neutral-400)" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.7" />
          <text x={p.x} y={p.y + 1} text-anchor="middle" dominant-baseline="central" fill="var(--color-neutral-400)" font-size="10">
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
    width: 240px;
    height: auto;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    background: #2d5a27;
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
