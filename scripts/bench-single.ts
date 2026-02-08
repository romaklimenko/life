import { SimulationEngine } from '../src/simulation/engine';
import { SimulationConfig } from '../src/types';

const config: SimulationConfig = {
    grass: { lifeExpectancy: 60, initialCount: 6000, spreadRate: 6 },
    sheep: { lifeExpectancy: 120, initialCount: 400, starvationTime: 25, breedThreshold: 4, grazingRadius: 3 },
    wolf: { lifeExpectancy: 150, initialCount: 50, starvationTime: 35, breedThreshold: 3, huntingRadius: 5 },
    gameSpeed: 10,
};

const engine = new SimulationEngine(config);
engine.initialize();

const start = performance.now();
let tick = 0;
while (tick < 2000 && !engine.hasEnded()) {
    engine.tick();
    tick++;
}
const elapsed = performance.now() - start;

console.log(`Ran ${tick} ticks in ${elapsed.toFixed(0)}ms (${(elapsed / tick).toFixed(2)} ms/tick)`);
console.log(`Ended: ${engine.hasEnded()}, extinct: ${engine.getExtinctPopulation()}`);
console.log(`Pops: ${JSON.stringify(engine.getPopulationCounts())}`);
