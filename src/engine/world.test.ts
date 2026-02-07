
import { describe, it, expect, beforeEach } from 'vitest';
import { World } from './world';
import { DEFAULT_CONFIG, ENTITY_GRASS, ENTITY_SHEEP, ENTITY_WOLF, ENTITY_EMPTY } from '../types';

describe('World Simulation', () => {
    let world: World;

    beforeEach(() => {
        // Use small grid for testing
        const config = { ...DEFAULT_CONFIG, gridSize: 10, sheepInitialCount: 0, wolfInitialCount: 0 };
        world = new World(config);
        // Clear random seed effect by resetting explicitly if needed, but constructor calls reset().
        // Since initial counts are 0, it should be empty except grass.
        // We can manually clear for precise testing.
        world.typeGrid.fill(ENTITY_EMPTY);
        world.movedGrid.fill(0);
        world.energyGrid.fill(0);
        world.ageGrid.fill(0);
    });

    it('should initialize with correct size', () => {
        expect(world.width).toBe(10);
        expect(world.height).toBe(10);
        expect(world.typeGrid.length).toBe(100);
    });

    it('should spawn entities correctly', () => {
        world.spawn(0, ENTITY_SHEEP, 50, 0);
        expect(world.typeGrid[0]).toBe(ENTITY_SHEEP);
        expect(world.energyGrid[0]).toBe(50);
    });

    it('sheep should move', () => {
        world.spawn(55, ENTITY_SHEEP, 100, 0); // Center: 5,5 -> index 55
        // We can't easily predict random move, but we can check it moved to a neighbor
        const initialPos = 55;

        // Mock Math.random to force a specific move? 
        // Or just update and check if 55 is empty and a neighbor is occupied.
        world.update();

        expect(world.typeGrid[initialPos]).toBe(ENTITY_EMPTY);

        // precise neighbor check
        const neighbors = world.getNeighbors(initialPos, 1);
        const occupied = neighbors.filter(n => world.typeGrid[n] === ENTITY_SHEEP);
        expect(occupied.length).toBe(1);
    });

    it('sheep should eat grass', () => {
        // Place sheep at 0, Grass at 1.
        world.spawn(0, ENTITY_SHEEP, 50, 0);
        world.spawn(1, ENTITY_GRASS);

        // Force sheep to move to 1? 
        // Random chance. 
        // Let's surround sheep with grass to guarantee eating.
        const neighbors = world.getNeighbors(0, 1);
        neighbors.forEach(n => world.spawn(n, ENTITY_GRASS));

        world.update();

        // Sheep should have moved to one of the neighbors
        // And energy should increase (50 - decay + eat_gain).
        // Decay=1, Eat=20 (hardcoded in World).
        // New energy = 50 - 1 + 20 = 69.

        // Find the sheep
        let sheepIdx = -1;
        for (let i = 0; i < 100; i++) {
            if (world.typeGrid[i] === ENTITY_SHEEP) {
                sheepIdx = i;
                break;
            }
        }

        expect(sheepIdx).not.toBe(-1);
        expect(world.energyGrid[sheepIdx]).toBe(69);
    });

    it('wolf should hunt sheep', () => {
        // Wolf at 0, Sheep at 1.
        world.spawn(0, ENTITY_WOLF, 100, 0);
        world.spawn(1, ENTITY_SHEEP, 50, 0);

        // Wolf hunting radius is default 10.
        // Wolf should see sheep and move towards it (or eat it if adjacent).
        // Distance is 1. Wolf eats immediately.

        world.update();

        // Wolf should be at 1. Sheep should be gone.
        expect(world.typeGrid[0]).toBe(ENTITY_EMPTY);
        expect(world.typeGrid[1]).toBe(ENTITY_WOLF); // Wolf moved to 1

        // Energy: 100 - 1 + 50 = 149
        expect(world.energyGrid[1]).toBe(149);
    });
});
