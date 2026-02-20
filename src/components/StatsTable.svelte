<script lang="ts">
  import { lineupStore } from '../stores/lineup';
  import { calcBatterRates } from '../lib/rates';
  import type { Player, BatterRates } from '../lib/models';

  // Compute rates for each filled slot
  $: ratesData = $lineupStore.map((slot, i) => {
    if (slot === null || slot.pa === 0) return null;
    try {
      return { player: slot, rates: calcBatterRates(slot) };
    } catch {
      return null;
    }
  });

  function fmt(v: number): string {
    return v.toFixed(3);
  }
</script>

<div class="stats-table">
  <h2>打者別イベント率</h2>
  <div class="table-scroll-wrapper">
  <table class="table table-compact table-zebra">
    <thead>
      <tr>
        <th>打順</th>
        <th>選手名</th>
        <th>p1B</th>
        <th>p2B</th>
        <th>p3B</th>
        <th>pHR</th>
        <th>pBB_HBP</th>
        <th>pK</th>
        <th>pOUT</th>
      </tr>
    </thead>
    <tbody>
      {#each ratesData as entry, i}
        <tr>
          <td class="center">{i + 1}</td>
          {#if entry}
            <td>{entry.player.name}</td>
            <td class="td-numeric">{fmt(entry.rates.single)}</td>
            <td class="td-numeric">{fmt(entry.rates.double)}</td>
            <td class="td-numeric">{fmt(entry.rates.triple)}</td>
            <td class="td-numeric">{fmt(entry.rates.hr)}</td>
            <td class="td-numeric">{fmt(entry.rates.bb_hbp)}</td>
            <td class="td-numeric">{fmt(entry.rates.k)}</td>
            <td class="td-numeric">{fmt(entry.rates.out)}</td>
          {:else}
            <td class="empty" colspan="8">—</td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
  </div>
</div>

<style>
  .stats-table {
    margin-bottom: var(--space-xl);
  }

  .table-scroll-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .center {
    text-align: center;
  }

  .empty {
    text-align: center;
    color: var(--color-text-muted);
  }
</style>
