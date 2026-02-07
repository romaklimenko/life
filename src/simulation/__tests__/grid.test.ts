/**
 * Grid Unit Tests
 * 
 * Tests for the Grid data structure including:
 * - Basic get/set operations
 * - Boundary checking
 * - Neighbor queries
 * - Radius search
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Grid } from '../grid';
import { EntityType, GrassEntity, SheepEntity, WolfEntity, GRID_WIDTH, GRID_HEIGHT } from '../../types';

describe('Grid', () => {
    let grid: Grid;

    beforeEach(() => {
        grid = new Grid();
    });

    describe('Basic Operations', () => {
        it('should initialize with all empty cells', () => {
            expect(grid.getType(0, 0)).toBe(EntityType.EMPTY);
            expect(grid.getType(127, 127)).toBe(EntityType.EMPTY);
            expect(grid.getType(254, 254)).toBe(EntityType.EMPTY);
        });

        it('should set and get grass entity', () => {
            const grass: GrassEntity = { type: EntityType.GRASS, x: 10, y: 20, age: 0 };
            grid.set(10, 20, grass);

            expect(grid.getType(10, 20)).toBe(EntityType.GRASS);
            expect(grid.get(10, 20)).toEqual(grass);
        });

        it('should set and get sheep entity', () => {
            const sheep: SheepEntity = {
                type: EntityType.SHEEP,
                x: 15,
                y: 25,
                age: 0,
                foodEaten: 0,
                ticksSinceLastMeal: 0
            };
            grid.set(15, 25, sheep);

            expect(grid.getType(15, 25)).toBe(EntityType.SHEEP);
            expect(grid.get(15, 25)).toEqual(sheep);
        });

        it('should set and get wolf entity', () => {
            const wolf: WolfEntity = {
                type: EntityType.WOLF,
                x: 30,
                y: 40,
                age: 0,
                foodEaten: 0,
                ticksSinceLastMeal: 0
            };
            grid.set(30, 40, wolf);

            expect(grid.getType(30, 40)).toBe(EntityType.WOLF);
            expect(grid.get(30, 40)).toEqual(wolf);
        });

        it('should clear an entity', () => {
            const grass: GrassEntity = { type: EntityType.GRASS, x: 5, y: 5, age: 0 };
            grid.set(5, 5, grass);
            grid.clear(5, 5);

            expect(grid.getType(5, 5)).toBe(EntityType.EMPTY);
            expect(grid.get(5, 5)).toBeNull();
        });

        it('should reset the grid', () => {
            grid.set(0, 0, { type: EntityType.GRASS, x: 0, y: 0, age: 0 });
            grid.set(100, 100, { type: EntityType.SHEEP, x: 100, y: 100, age: 0, foodEaten: 0, ticksSinceLastMeal: 0 });
            grid.reset();

            expect(grid.getType(0, 0)).toBe(EntityType.EMPTY);
            expect(grid.getType(100, 100)).toBe(EntityType.EMPTY);
            expect(grid.getAllEntities()).toHaveLength(0);
        });
    });

    describe('Boundary Checking', () => {
        it('should validate positions within bounds', () => {
            expect(grid.isValidPosition(0, 0)).toBe(true);
            expect(grid.isValidPosition(254, 254)).toBe(true);
            expect(grid.isValidPosition(127, 127)).toBe(true);
        });

        it('should reject positions outside bounds', () => {
            expect(grid.isValidPosition(-1, 0)).toBe(false);
            expect(grid.isValidPosition(0, -1)).toBe(false);
            expect(grid.isValidPosition(255, 0)).toBe(false);
            expect(grid.isValidPosition(0, 255)).toBe(false);
            expect(grid.isValidPosition(300, 300)).toBe(false);
        });

        it('should return EMPTY for out-of-bounds positions', () => {
            expect(grid.getType(-1, 0)).toBe(EntityType.EMPTY);
            expect(grid.getType(0, 300)).toBe(EntityType.EMPTY);
        });

        it('should return null for out-of-bounds get', () => {
            expect(grid.get(-1, 0)).toBeNull();
            expect(grid.get(0, 300)).toBeNull();
        });
    });

    describe('Neighbor Queries', () => {
        it('should get all 8 neighbors for center position', () => {
            const neighbors = grid.getNeighborPositions(127, 127);
            expect(neighbors).toHaveLength(8);
        });

        it('should get 3 neighbors for corner position', () => {
            const neighbors = grid.getNeighborPositions(0, 0);
            expect(neighbors).toHaveLength(3);
            expect(neighbors).toContainEqual({ x: 1, y: 0 });
            expect(neighbors).toContainEqual({ x: 0, y: 1 });
            expect(neighbors).toContainEqual({ x: 1, y: 1 });
        });

        it('should get 5 neighbors for edge position', () => {
            const neighbors = grid.getNeighborPositions(0, 127);
            expect(neighbors).toHaveLength(5);
        });

        it('should get 4 cardinal neighbors for center position', () => {
            const neighbors = grid.getCardinalNeighborPositions(127, 127);
            expect(neighbors).toHaveLength(4);
        });

        it('should get empty neighbors only', () => {
            // Place some entities
            grid.set(126, 127, { type: EntityType.GRASS, x: 126, y: 127, age: 0 });
            grid.set(128, 127, { type: EntityType.SHEEP, x: 128, y: 127, age: 0, foodEaten: 0, ticksSinceLastMeal: 0 });

            const emptyNeighbors = grid.getEmptyNeighbors(127, 127);
            expect(emptyNeighbors).toHaveLength(6); // 8 - 2 occupied
            expect(emptyNeighbors).not.toContainEqual({ x: 126, y: 127 });
            expect(emptyNeighbors).not.toContainEqual({ x: 128, y: 127 });
        });
    });

    describe('Radius Search', () => {
        it('should find entities within radius', () => {
            // Place sheep around center
            const sheep1: SheepEntity = { type: EntityType.SHEEP, x: 127, y: 125, age: 0, foodEaten: 0, ticksSinceLastMeal: 0 };
            const sheep2: SheepEntity = { type: EntityType.SHEEP, x: 129, y: 127, age: 0, foodEaten: 0, ticksSinceLastMeal: 0 };
            grid.set(127, 125, sheep1);
            grid.set(129, 127, sheep2);

            const found = grid.findInRadius(127, 127, 3, EntityType.SHEEP);
            expect(found).toHaveLength(2);
        });

        it('should not find entities outside radius', () => {
            const sheep: SheepEntity = { type: EntityType.SHEEP, x: 140, y: 140, age: 0, foodEaten: 0, ticksSinceLastMeal: 0 };
            grid.set(140, 140, sheep);

            const found = grid.findInRadius(127, 127, 5, EntityType.SHEEP);
            expect(found).toHaveLength(0);
        });

        it('should find closest entity in radius', () => {
            const farSheep: SheepEntity = { type: EntityType.SHEEP, x: 130, y: 127, age: 0, foodEaten: 0, ticksSinceLastMeal: 0 };
            const closeSheep: SheepEntity = { type: EntityType.SHEEP, x: 128, y: 127, age: 0, foodEaten: 0, ticksSinceLastMeal: 0 };
            grid.set(130, 127, farSheep);
            grid.set(128, 127, closeSheep);

            const result = grid.findClosestInRadius(127, 127, 5, EntityType.SHEEP);
            expect(result).not.toBeNull();
            expect(result!.entity).toEqual(closeSheep);
            expect(result!.distance).toBe(1);
        });
    });

    describe('Entity Retrieval', () => {
        it('should get all entities of a type', () => {
            grid.set(10, 10, { type: EntityType.GRASS, x: 10, y: 10, age: 0 });
            grid.set(20, 20, { type: EntityType.GRASS, x: 20, y: 20, age: 0 });
            grid.set(30, 30, { type: EntityType.SHEEP, x: 30, y: 30, age: 0, foodEaten: 0, ticksSinceLastMeal: 0 });

            const grass = grid.getEntitiesOfType(EntityType.GRASS);
            expect(grass).toHaveLength(2);
        });

        it('should count entities correctly', () => {
            grid.set(10, 10, { type: EntityType.GRASS, x: 10, y: 10, age: 0 });
            grid.set(20, 20, { type: EntityType.GRASS, x: 20, y: 20, age: 0 });
            grid.set(30, 30, { type: EntityType.SHEEP, x: 30, y: 30, age: 0, foodEaten: 0, ticksSinceLastMeal: 0 });
            grid.set(40, 40, { type: EntityType.WOLF, x: 40, y: 40, age: 0, foodEaten: 0, ticksSinceLastMeal: 0 });

            const counts = grid.getCounts();
            expect(counts.grass).toBe(2);
            expect(counts.sheep).toBe(1);
            expect(counts.wolves).toBe(1);
        });
    });

    describe('Random Position Helpers', () => {
        it('should find empty position on mostly empty grid', () => {
            const pos = grid.getRandomEmptyPosition();
            expect(pos).not.toBeNull();
            expect(grid.isValidPosition(pos!.x, pos!.y)).toBe(true);
            expect(grid.getType(pos!.x, pos!.y)).toBe(EntityType.EMPTY);
        });

        it('should find random empty neighbor', () => {
            // Leave some neighbors empty
            grid.set(126, 127, { type: EntityType.GRASS, x: 126, y: 127, age: 0 });

            const pos = grid.getRandomEmptyNeighbor(127, 127);
            expect(pos).not.toBeNull();
            expect(grid.getType(pos!.x, pos!.y)).toBe(EntityType.EMPTY);
        });
    });
});
