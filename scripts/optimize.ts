/**
 * Fast optimizer — starts from known-good baseline (from partial run results),
 * uses 3 runs per config, 2 refinement rounds. Should finish in ~10 minutes.
 */

import { SimulationEngine } from '../src/simulation/engine';
import { SimulationConfig } from '../src/types';

const MAX_TICKS = 3_000;
const QUICK = 3;
const FULL = 15;

function runOnce(config: SimulationConfig) {
    const engine = new SimulationEngine(config);
    engine.initialize();
    while (!engine.hasEnded() && engine.getTick() < MAX_TICKS) engine.tick();
    return { ticks: engine.getTick(), extinct: engine.getExtinctPopulation() };
}

function bench(config: SimulationConfig, n: number) {
    const ticks: number[] = [];
    const ext: Record<string, number> = {};
    for (let i = 0; i < n; i++) {
        const r = runOnce(config);
        ticks.push(r.ticks);
        ext[r.extinct ?? 'survived'] = (ext[r.extinct ?? 'survived'] || 0) + 1;
    }
    ticks.sort((a, b) => a - b);
    return {
        avg: ticks.reduce((a, b) => a + b, 0) / n,
        med: ticks[Math.floor(n / 2)],
        min: ticks[0], max: ticks[n - 1], ext
    };
}

// Best known from partial optimization runs
const best = {
    grassLife: 40, grassCount: 2000, grassSpread: 30, grassRadius: 2,
    sheepLife: 200, sheepCount: 400, sheepStarve: 10, sheepBreed: 20, sheepRadius: 5,
    wolfLife: 250, wolfCount: 100, wolfStarve: 80, wolfBreed: 6, wolfRadius: 4,
};

type P = typeof best;
function toConfig(p: P): SimulationConfig {
    return {
        grass: { lifeExpectancy: p.grassLife, initialCount: p.grassCount, spreadRate: p.grassSpread, spreadRadius: p.grassRadius },
        sheep: { lifeExpectancy: p.sheepLife, initialCount: p.sheepCount, starvationTime: p.sheepStarve, breedThreshold: p.sheepBreed, grazingRadius: p.sheepRadius },
        wolf: { lifeExpectancy: p.wolfLife, initialCount: p.wolfCount, starvationTime: p.wolfStarve, breedThreshold: p.wolfBreed, huntingRadius: p.wolfRadius },
        gameSpeed: 10,
    };
}

function fmt(r: ReturnType<typeof bench>) {
    return `avg=${r.avg.toFixed(0)} med=${r.med} min=${r.min} max=${r.max} ext=${JSON.stringify(r.ext)}`;
}

function refine(param: keyof P, values: number[], runs = QUICK) {
    let bestAvg = 0, bestVal = best[param];
    for (const val of values) {
        const r = bench(toConfig({ ...best, [param]: val }), runs);
        console.log(`  ${param}=${val}: ${fmt(r)}`);
        if (r.avg > bestAvg) { bestAvg = r.avg; bestVal = val; }
    }
    best[param] = bestVal;
    console.log(`  >>> ${param}=${bestVal} (avg=${bestAvg.toFixed(0)})\n`);
}

// ============================================================================
// Baseline check
// ============================================================================
console.log('=== Baseline check ===\n');
const base = bench(toConfig(best), QUICK);
console.log(`Baseline: ${fmt(base)}\n`);

// ============================================================================
// Round 1: Quick sweep of all params (5 values each, 3 runs)
// ============================================================================
console.log('=== Round 1: Quick sweep ===\n');
refine('grassRadius', [1, 2, 3, 5, 8]);
refine('grassLife', [30, 40, 60, 80, 120]);
refine('grassSpread', [15, 20, 30, 50, 80]);
refine('grassCount', [1000, 2000, 3000, 5000]);
refine('sheepBreed', [10, 15, 20, 25, 30]);
refine('wolfBreed', [4, 6, 8, 10]);
refine('sheepCount', [200, 400, 600, 800]);
refine('wolfCount', [60, 80, 100, 130]);
refine('sheepStarve', [5, 10, 15, 20]);
refine('wolfStarve', [50, 70, 80, 100]);
refine('sheepRadius', [3, 5, 7, 10]);
refine('wolfRadius', [3, 4, 5, 7]);
refine('sheepLife', [120, 200, 300]);
refine('wolfLife', [150, 250, 350]);

console.log('After Round 1:');
console.log(JSON.stringify(best, null, 2));
const r1 = bench(toConfig(best), QUICK);
console.log(`Validation: ${fmt(r1)}\n`);

// ============================================================================
// Round 2: Fine-tune around Round 1 winners (narrow range, 3 runs)
// ============================================================================
console.log('=== Round 2: Fine-tune ===\n');

function narrow(c: number, step: number) {
    return [...new Set([c - 2 * step, c - step, c, c + step, c + 2 * step].filter(v => v >= 1))];
}

refine('grassRadius', narrow(best.grassRadius, 1));
refine('grassLife', narrow(best.grassLife, 5));
refine('grassSpread', narrow(best.grassSpread, 5));
refine('grassCount', narrow(best.grassCount, 300));
refine('sheepBreed', narrow(best.sheepBreed, 2));
refine('wolfBreed', narrow(best.wolfBreed, 1));
refine('sheepCount', narrow(best.sheepCount, 50));
refine('wolfCount', narrow(best.wolfCount, 10));
refine('sheepStarve', narrow(best.sheepStarve, 2));
refine('wolfStarve', narrow(best.wolfStarve, 5));

console.log('After Round 2:');
console.log(JSON.stringify(best, null, 2));

// ============================================================================
// Final validation with more runs
// ============================================================================
console.log('\n=== FINAL VALIDATION (15 runs) ===\n');

const finalOpt = bench(toConfig(best), FULL);
console.log(`OPTIMIZED: ${fmt(finalOpt)}`);

const oldDef = {
    grassLife: 60, grassCount: 6000, grassSpread: 6, grassRadius: 3,
    sheepLife: 120, sheepCount: 400, sheepStarve: 25, sheepBreed: 4, sheepRadius: 3,
    wolfLife: 150, wolfCount: 50, wolfStarve: 35, wolfBreed: 3, wolfRadius: 5,
};
const finalDef = bench(toConfig(oldDef), FULL);
console.log(`OLD DEFAULTS: ${fmt(finalDef)}`);

console.log(`\nImprovement: ${((finalOpt.avg - finalDef.avg) / finalDef.avg * 100).toFixed(0)}%`);

console.log('\n=== OPTIMAL CONFIG ===');
console.log(JSON.stringify(toConfig(best), null, 2));
console.log('\nRaw:');
console.log(JSON.stringify(best, null, 2));
