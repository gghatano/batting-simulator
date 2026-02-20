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
  <table>
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
            <td class="num">{fmt(entry.rates.single)}</td>
            <td class="num">{fmt(entry.rates.double)}</td>
            <td class="num">{fmt(entry.rates.triple)}</td>
            <td class="num">{fmt(entry.rates.hr)}</td>
            <td class="num">{fmt(entry.rates.bb_hbp)}</td>
            <td class="num">{fmt(entry.rates.k)}</td>
            <td class="num">{fmt(entry.rates.out)}</td>
          {:else}
            <td class="empty" colspan="8">—</td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .stats-table {
    margin-bottom: 1.5rem;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.9rem;
  }

  th, td {
    border: 1px solid #ccc;
    padding: 0.35rem 0.6rem;
  }

  th {
    background: #f8f8f8;
    text-align: center;
    white-space: nowrap;
  }

  .center {
    text-align: center;
  }

  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .empty {
    text-align: center;
    color: #999;
  }
</style>
