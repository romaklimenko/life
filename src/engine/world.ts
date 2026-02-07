
import {
    DEFAULT_CONFIG,
    ENTITY_EMPTY,
    ENTITY_GRASS,
    ENTITY_SHEEP,
    ENTITY_WOLF
} from '../types';
import type { SimulationConfig, EntityType } from '../types';

export class World {
    width: number;
    height: number;
    size: number;

    // Arrays for state
    typeGrid: Uint8Array;
    ageGrid: Uint16Array;
    energyGrid: Uint16Array;

    // Helper to track if entity moved this tick
    movedGrid: Uint8Array;

    config: SimulationConfig;

    stats: {
        grass: number;
        sheep: number;
        wolf: number;
        tick: number;
    };

    constructor(config: SimulationConfig = DEFAULT_CONFIG) {
        this.config = config;
        this.width = config.gridSize;
        this.height = config.gridSize;
        this.size = this.width * this.height;

        this.typeGrid = new Uint8Array(this.size);
        this.ageGrid = new Uint16Array(this.size);
        this.energyGrid = new Uint16Array(this.size);
        this.movedGrid = new Uint8Array(this.size); // 0 or 1

        this.stats = { grass: 0, sheep: 0, wolf: 0, tick: 0 };

        this.reset();
    }

    reset() {
        this.typeGrid.fill(ENTITY_EMPTY);
        this.ageGrid.fill(0);
        this.energyGrid.fill(0);
        this.movedGrid.fill(0);
        this.stats = { grass: 0, sheep: 0, wolf: 0, tick: 0 };
        this.seed();
    }

    seed() {
        const { sheepInitialCount, wolfInitialCount } = this.config;
        // We'll use grassRegrowthRate roughly for initial seed density or just 50%? 
        // "Randomly seed grass, sheep, and wolves".

        // Seed Grass (e.g. 20% coverage)
        for (let i = 0; i < this.size; i++) {
            if (Math.random() < 0.2) {
                this.spawn(i, ENTITY_GRASS);
            }
        }

        // Seed Sheep
        for (let i = 0; i < sheepInitialCount; i++) {
            const idx = Math.floor(Math.random() * this.size);
            this.spawn(idx, ENTITY_SHEEP, 50, 0); // 50 energy
        }

        // Seed Wolves
        for (let i = 0; i < wolfInitialCount; i++) {
            const idx = Math.floor(Math.random() * this.size);
            this.spawn(idx, ENTITY_WOLF, 100, 0); // 100 energy
        }
    }

    spawn(index: number, type: EntityType, energy: number = 0, age: number = 0) {
        // Simple overwrite rules
        this.typeGrid[index] = type;
        this.energyGrid[index] = energy;
        this.ageGrid[index] = age;
        this.movedGrid[index] = 1; // Mark as processed/moved so they don't act immediately on spawn if spawn happens during loop
    }

    getNeighbors(index: number, radius: number = 1): number[] {
        // Return indices within radius (Manhattan or Chebyshev? Chebyshev (square) is easier on grid)
        // For radius 1 (Moore neighborhood)
        // Optimization: Handle wrapping or clipping. "Board" usually implies either walls or torus. 
        // Let's implement Torus (wrapping) for continuity, or Walls. Docs didn't specify. Torus is standard for "Life".

        const x = index % this.width;
        const y = Math.floor(index / this.width);
        const neighbors: number[] = [];

        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx === 0 && dy === 0) continue;

                // Torus wrapping
                let nx = (x + dx + this.width) % this.width;
                let ny = (y + dy + this.height) % this.height;

                neighbors.push(ny * this.width + nx);
            }
        }
        return neighbors;
    }

    update() {
        this.stats.tick++;
        this.movedGrid.fill(0); // Reset moved status

        // To avoid bias, we should iterate randomly. But Fisher-Yates on 65k every tick is heavy.
        // We can use a random offset + coprimes? Or just linear with alternating direction?
        // Linear scan is simplest for MVP. Bias is acceptable.

        let grassCount = 0;
        let sheepCount = 0;
        let wolfCount = 0;

        for (let i = 0; i < this.size; i++) {
            const type = this.typeGrid[i];

            if (type === ENTITY_EMPTY) {
                // Chance to grow grass
                if (Math.random() < this.config.grassRegrowthRate * 0.01) { // regrowth rate is 0-1? let's assume probability
                    this.typeGrid[i] = ENTITY_GRASS;
                    this.ageGrid[i] = 0;
                    grassCount++;
                }
                continue;
            }

            if (this.movedGrid[i]) {
                if (type === ENTITY_GRASS) grassCount++;
                if (type === ENTITY_SHEEP) sheepCount++;
                if (type === ENTITY_WOLF) wolfCount++;
                continue; // Already acted
            }

            if (type === ENTITY_GRASS) {
                this.ageGrid[i]++;
                // Grass Logic: Maybe die of old age?
                // if (this.ageGrid[i] > this.config.grassLifeExpectancy) { ... }
                grassCount++;
            }
            else if (type === ENTITY_SHEEP) {
                this.updateSheep(i);
                // Note: we can't easily track count here because updateSheep moves it.
                // We'll count at the end or track deltas. 
                // Actually, estimating counts during loop is hard. We can count after loop or maintain counters.
            }
            else if (type === ENTITY_WOLF) {
                this.updateWolf(i);
            }
        }

        // Recalculate accurate stats after loop (or maintain in realtime, but linear scan is cheap enough for 65k)
        this.updateStats();
    }

    updateStats() {
        let g = 0, s = 0, w = 0;
        for (let i = 0; i < this.size; i++) {
            const t = this.typeGrid[i];
            if (t === ENTITY_GRASS) g++;
            else if (t === ENTITY_SHEEP) s++;
            else if (t === ENTITY_WOLF) w++;
        }
        this.stats.grass = g;
        this.stats.sheep = s;
        this.stats.wolf = w;
    }

    updateSheep(i: number) {
        // 1. Age & Energy
        let age = this.ageGrid[i];
        let energy = this.energyGrid[i];

        age++;
        energy -= this.config.sheepEnergyDecay;

        if (age > this.config.sheepLifeExpectancy || energy <= 0) {
            this.kill(i);
            return;
        }

        // 2. Move & Eat
        // Sheep moves randomly to a neighbor. 
        // Only valid moves: Empty or Grass.
        // If Grass: Eat (+Energy).
        const neighbors = this.getNeighbors(i, 1);

        // Filter valid moves
        const validMoves = neighbors.filter(n => {
            const t = this.typeGrid[n];
            return t === ENTITY_EMPTY || t === ENTITY_GRASS;
        });

        if (validMoves.length > 0) {
            const target = validMoves[Math.floor(Math.random() * validMoves.length)];
            const targetType = this.typeGrid[target];

            // Move
            this.moveEntity(i, target);

            // Eat
            if (targetType === ENTITY_GRASS) {
                // Grass grants energy? "how many grass to eat to breed". 
                // Implicitly implies eating gives resources.
                // Let's say eating 1 grass gives +10 energy? Or counts towards breed counter?
                // "how many sheep a wolf can eat to breed, or how many grass to eat to breed for a sheep"
                // This implies a "food eaten" counter, not just energy.
                // Let's use Energy to track "food eaten" roughly, or simplify.
                // If reproduction threshold is 10, each grass adds 1 "breed energy"?
                // Let's just say Eating adds energy.
                energy += 20; // Hardcoded or config? 
                // Assuming "Food to breed" is basically "Energy > Threshold".
            }

            // Update local vars (since index 'i' is now empty, we operate on 'target')
            this.energyGrid[target] = energy;
            this.ageGrid[target] = age;

            // 3. Reproduce
            // "how many grass to eat to breed" -> Let's check config threshold.
            if (energy >= this.config.sheepReproductionThreshold * 10) { // Scale factor? 
                // Or if threshold is straight count. Let's use `energy` as the counter.
                // Reset energy after breed?
                // Try to spawn in empty neighbor of target
                const breedNeighbors = this.getNeighbors(target, 1).filter(n => this.typeGrid[n] === ENTITY_EMPTY);
                if (breedNeighbors.length > 0) {
                    const birthSpot = breedNeighbors[Math.floor(Math.random() * breedNeighbors.length)];
                    this.spawn(birthSpot, ENTITY_SHEEP, 50, 0); // Baby sheep
                    this.energyGrid[target] -= 30; // Cost to breed
                }
            }
        } else {
            // No move possible, stay put
            this.energyGrid[i] = energy;
            this.ageGrid[i] = age;
            this.movedGrid[i] = 1;
        }
    }

    updateWolf(i: number) {
        let age = this.ageGrid[i];
        let energy = this.energyGrid[i];

        age++;
        energy -= this.config.wolfEnergyDecay;

        if (age > this.config.wolfLifeExpectancy || energy <= 0) {
            this.kill(i);
            return;
        }

        // Hunt logic: Look for sheep in radius
        const radius = this.config.wolfHuntingRadius;
        // Optimization: Don't scan huge radius. 
        // Simple scan: check concentric rings or just scan square area.
        // For efficiency, maybe just check immediate neighbors first, then farther?
        // Let's do simple square scan.

        let target = -1;
        let minDist = Infinity;

        // Helper to get XY
        const rx = i % this.width;
        const ry = Math.floor(i / this.width);

        // Simple loop for vision (expensive if radius large)
        // Optimization: limit max checks or use efficient lookups.
        // Radius 10 => 400 cells. 65k wolves? Too slow.
        // Limit vision to maybe radius 5 or optimize.

        // Find closest sheep
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx === 0 && dy === 0) continue;
                // Torus
                let nx = (rx + dx + this.width) % this.width;
                let ny = (ry + dy + this.height) % this.height;
                const idx = ny * this.width + nx;

                if (this.typeGrid[idx] === ENTITY_SHEEP) {
                    const dist = dx * dx + dy * dy;
                    if (dist < minDist) {
                        minDist = dist;
                        target = idx;
                    }
                }
            }
        }

        let nextUnknownPos = -1;

        if (target !== -1) {
            // Move towards target (1 step)
            // Determine direction
            const tx = target % this.width;
            const ty = Math.floor(target / this.width);

            // Calculate direction with wrapping handling... tricky.
            // Simplified: just move to neighbor that minimizes distance to target?
            // Yes.
            // We want to move to a spot that is CLOSER to target
            // But strict torus distance is hard.
            // Let's just pick neighbor with smallest coordinate distance logic

            // Actually, we already know dx, dy to target roughly (but wrapping makes it ambiguous).
            // Let's just use the `getNeighbors` and pick one that contains a Sheep (instant eat) or is empty/grass and closer.

            // Check if any neighbor IS the target (distance 1)
            if (minDist <= 2) { // roughly adjacent (1^2 + 1^2 = 2)
                // Move directly to eat
                nextUnknownPos = target;
            } else {
                // Move closer
                // Pick neighbor with min distance to tx,ty
                // ...
                // Logic omitted for brevity, simple random move fallback if too complex for now?
                // Let's implement simple sign logic.
                let dx = tx - rx;
                let dy = ty - ry;
                // Wrap fix
                if (dx > this.width / 2) dx -= this.width;
                if (dx < -this.width / 2) dx += this.width;
                if (dy > this.height / 2) dy -= this.height;
                if (dy < -this.height / 2) dy += this.height;

                const stepX = Math.sign(dx);
                const stepY = Math.sign(dy);

                // Ideal move: (rx+stepX, ry+stepY)
                // Try X only, Y only, or Diagonal
                // We need to map back to index
                const nx = (rx + stepX + this.width) % this.width;
                const ny = (ry + stepY + this.height) % this.height;
                nextUnknownPos = ny * this.width + nx;
            }
        } else {
            // Random move
            const neighbors = this.getNeighbors(i, 1);
            nextUnknownPos = neighbors[Math.floor(Math.random() * neighbors.length)];
        }

        // Execute Move
        if (nextUnknownPos !== -1) {
            const targetType = this.typeGrid[nextUnknownPos];

            // Wolf can move to Empty, Grass, or Sheep. (Can't move to Wolf)
            if (targetType !== ENTITY_WOLF) {
                this.moveEntity(i, nextUnknownPos);

                if (targetType === ENTITY_SHEEP) {
                    // Eat
                    energy += 50;
                }

                this.energyGrid[nextUnknownPos] = energy;
                this.ageGrid[nextUnknownPos] = age;

                // Reproduce
                if (energy >= this.config.wolfReproductionThreshold * 10) {
                    const breedNeighbors = this.getNeighbors(nextUnknownPos, 1).filter(n => this.typeGrid[n] === ENTITY_EMPTY);
                    if (breedNeighbors.length > 0) {
                        const birthSpot = breedNeighbors[Math.floor(Math.random() * breedNeighbors.length)];
                        this.spawn(birthSpot, ENTITY_WOLF, 80, 0);
                        this.energyGrid[nextUnknownPos] -= 40;
                    }
                }
            } else {
                // Blocked by another wolf, stay
                this.energyGrid[i] = energy;
                this.ageGrid[i] = age;
                this.movedGrid[i] = 1;
            }
        }
    }

    moveEntity(from: number, to: number) {
        this.typeGrid[to] = this.typeGrid[from];
        this.typeGrid[from] = ENTITY_EMPTY;
        this.movedGrid[to] = 1;
        // Note: energy and age are carried over by the caller updating `to`.
    }

    kill(index: number) {
        this.typeGrid[index] = ENTITY_EMPTY;
        this.ageGrid[index] = 0;
        this.energyGrid[index] = 0;
    }
}
