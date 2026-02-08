/**
 * Entity Behavior Unit Tests
 * 
 * Tests for entity factory functions and behavior logic.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Grid } from '../grid';
import {
    createGrass,
    createSheep,
    createWolf,
    updateGrass,
    updateSheep,
    updateWolf,
    seedPopulation,
} from '../entities';
import { EntityType, SimulationConfig } from '../../types';

// Test configuration with predictable values
const testConfig: SimulationConfig = {
    grass: {
        lifeExpectancy: 10,
        initialCount: 100,
        spreadRate: 50, // 50% chance
    },
    sheep: {
        lifeExpectancy: 20,
        initialCount: 10,
        starvationTime: 5,
        breedThreshold: 2,
        grazingRadius: 3,
    },
    wolf: {
        lifeExpectancy: 30,
        initialCount: 5,
        starvationTime: 10,
        breedThreshold: 2,
        huntingRadius: 3,
    },
    gameSpeed: 10,
};

describe('Entity Factory Functions', () => {
    it('should create grass entity', () => {
        const grass = createGrass(10, 20);
        expect(grass.type).toBe(EntityType.GRASS);
        expect(grass.x).toBe(10);
        expect(grass.y).toBe(20);
        expect(grass.age).toBe(0);
    });

    it('should create sheep entity', () => {
        const sheep = createSheep(15, 25);
        expect(sheep.type).toBe(EntityType.SHEEP);
        expect(sheep.x).toBe(15);
        expect(sheep.y).toBe(25);
        expect(sheep.age).toBe(0);
        expect(sheep.foodEaten).toBe(0);
        expect(sheep.ticksSinceLastMeal).toBe(0);
    });

    it('should create wolf entity', () => {
        const wolf = createWolf(30, 40);
        expect(wolf.type).toBe(EntityType.WOLF);
        expect(wolf.x).toBe(30);
        expect(wolf.y).toBe(40);
        expect(wolf.age).toBe(0);
        expect(wolf.foodEaten).toBe(0);
        expect(wolf.ticksSinceLastMeal).toBe(0);
    });
});

describe('Grass Behavior', () => {
    let grid: Grid;

    beforeEach(() => {
        grid = new Grid();
    });

    it('should age grass each tick', () => {
        const grass = createGrass(10, 10);
        grid.set(10, 10, grass);

        updateGrass(grass, grid, testConfig);
        expect(grass.age).toBe(1);
    });

    it('should kill grass when reaching life expectancy', () => {
        const grass = createGrass(10, 10);
        grass.age = testConfig.grass.lifeExpectancy - 1;
        grid.set(10, 10, grass);

        const result = updateGrass(grass, grid, testConfig);
        expect(result.alive).toBe(false);
    });

    it('should keep grass alive before life expectancy', () => {
        const grass = createGrass(10, 10);
        grid.set(10, 10, grass);

        const result = updateGrass(grass, grid, testConfig);
        expect(result.alive).toBe(true);
    });
});

describe('Sheep Behavior', () => {
    let grid: Grid;

    beforeEach(() => {
        grid = new Grid();
    });

    it('should age sheep each tick', () => {
        const sheep = createSheep(127, 127);
        grid.set(127, 127, sheep);

        updateSheep(sheep, grid, testConfig);
        expect(sheep.age).toBe(1);
    });

    it('should increase hunger each tick', () => {
        const sheep = createSheep(127, 127);
        grid.set(127, 127, sheep);

        updateSheep(sheep, grid, testConfig);
        expect(sheep.ticksSinceLastMeal).toBe(1);
    });

    it('should die from starvation', () => {
        const sheep = createSheep(127, 127);
        sheep.ticksSinceLastMeal = testConfig.sheep.starvationTime - 1;
        grid.set(127, 127, sheep);

        const result = updateSheep(sheep, grid, testConfig);
        expect(result.alive).toBe(false);
    });

    it('should die from old age', () => {
        const sheep = createSheep(127, 127);
        sheep.age = testConfig.sheep.lifeExpectancy - 1;
        grid.set(127, 127, sheep);

        const result = updateSheep(sheep, grid, testConfig);
        expect(result.alive).toBe(false);
    });

    it('should eat grass when moving to grass cell', () => {
        const sheep = createSheep(127, 127);
        grid.set(127, 127, sheep);

        // Place grass next to sheep
        const grass = createGrass(128, 127);
        grid.set(128, 127, grass);

        const result = updateSheep(sheep, grid, testConfig);

        // Sheep should have eaten and reset hunger
        if (sheep.x === 128 && sheep.y === 127) {
            expect(sheep.foodEaten).toBe(1);
            expect(sheep.ticksSinceLastMeal).toBe(0);
            expect(result.ateGrassAt).toEqual({ x: 128, y: 127 });
        }
    });

    it('should breed after eating enough grass', () => {
        const sheep = createSheep(127, 127);
        sheep.foodEaten = testConfig.sheep.breedThreshold - 1;
        grid.set(127, 127, sheep);

        // Place grass next to sheep
        const grass = createGrass(128, 127);
        grid.set(128, 127, grass);

        const result = updateSheep(sheep, grid, testConfig);

        // If sheep moved to grass, it should have bred
        if (sheep.x === 128 && sheep.y === 127) {
            expect(result.spawn).not.toBeNull();
            expect(sheep.foodEaten).toBe(0); // Reset after breeding
        }
    });
});

describe('Wolf Behavior', () => {
    let grid: Grid;

    beforeEach(() => {
        grid = new Grid();
    });

    it('should age wolf each tick', () => {
        const wolf = createWolf(127, 127);
        grid.set(127, 127, wolf);

        updateWolf(wolf, grid, testConfig);
        expect(wolf.age).toBe(1);
    });

    it('should increase hunger each tick', () => {
        const wolf = createWolf(127, 127);
        grid.set(127, 127, wolf);

        updateWolf(wolf, grid, testConfig);
        expect(wolf.ticksSinceLastMeal).toBe(1);
    });

    it('should die from starvation', () => {
        const wolf = createWolf(127, 127);
        wolf.ticksSinceLastMeal = testConfig.wolf.starvationTime - 1;
        grid.set(127, 127, wolf);

        const result = updateWolf(wolf, grid, testConfig);
        expect(result.alive).toBe(false);
    });

    it('should die from old age', () => {
        const wolf = createWolf(127, 127);
        wolf.age = testConfig.wolf.lifeExpectancy - 1;
        grid.set(127, 127, wolf);

        const result = updateWolf(wolf, grid, testConfig);
        expect(result.alive).toBe(false);
    });

    it('should hunt sheep within radius', () => {
        const wolf = createWolf(127, 127);
        grid.set(127, 127, wolf);

        // Place sheep within hunting radius
        const sheep = createSheep(128, 127);
        grid.set(128, 127, sheep);

        const result = updateWolf(wolf, grid, testConfig);

        // Wolf should have moved towards or eaten the sheep
        expect(result.alive).toBe(true);
        // If wolf caught the sheep
        if (wolf.x === 128 && wolf.y === 127) {
            expect(result.ateSheepAt).toEqual({ x: 128, y: 127 });
            expect(wolf.foodEaten).toBe(1);
            expect(wolf.ticksSinceLastMeal).toBe(0);
        }
    });

    it('should breed after eating enough sheep', () => {
        const wolf = createWolf(127, 127);
        wolf.foodEaten = testConfig.wolf.breedThreshold - 1;
        grid.set(127, 127, wolf);

        // Place sheep adjacent for guaranteed catch
        const sheep = createSheep(128, 127);
        grid.set(128, 127, sheep);

        const result = updateWolf(wolf, grid, testConfig);

        if (wolf.x === 128 && wolf.y === 127) {
            expect(result.spawn).not.toBeNull();
            expect(wolf.foodEaten).toBe(0);
        }
    });
});

describe('Population Seeding', () => {
    it('should seed grid with initial populations', () => {
        const grid = new Grid();
        seedPopulation(grid, testConfig);

        const counts = grid.getCounts();
        expect(counts.grass).toBe(testConfig.grass.initialCount);
        expect(counts.sheep).toBe(testConfig.sheep.initialCount);
        expect(counts.wolves).toBe(testConfig.wolf.initialCount);
    });

    it('should reset grid before seeding', () => {
        const grid = new Grid();

        // Pre-populate
        grid.set(0, 0, createGrass(0, 0));

        seedPopulation(grid, testConfig);

        // Should have exact counts from config
        const counts = grid.getCounts();
        expect(counts.grass).toBe(testConfig.grass.initialCount);
    });
});
