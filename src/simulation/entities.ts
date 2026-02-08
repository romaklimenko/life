/**
 * Life Ecosystem Simulation - Entity Behaviors
 * 
 * This file contains factory functions for creating entities and
 * behavior functions for updating entity state each tick.
 * 
 * Entity lifecycle:
 * 1. Spawn (via factory function)
 * 2. Update (via behavior function) - age, move, eat, breed
 * 3. Die (via behavior function) - old age, starvation, predation
 */

import {
    EntityType,
    GrassEntity,
    SheepEntity,
    WolfEntity,
    SimulationConfig,
} from '../types';
import { Grid } from './grid';

// ============================================================================
// Entity Factory Functions
// ============================================================================

/**
 * Creates a new grass entity at the specified position.
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns New grass entity
 */
export function createGrass(x: number, y: number): GrassEntity {
    return {
        type: EntityType.GRASS,
        x,
        y,
        age: 0,
    };
}

/**
 * Creates a new sheep entity at the specified position.
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns New sheep entity
 */
export function createSheep(x: number, y: number): SheepEntity {
    return {
        type: EntityType.SHEEP,
        x,
        y,
        age: 0,
        foodEaten: 0,
        ticksSinceLastMeal: 0,
    };
}

/**
 * Creates a new wolf entity at the specified position.
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns New wolf entity
 */
export function createWolf(x: number, y: number): WolfEntity {
    return {
        type: EntityType.WOLF,
        x,
        y,
        age: 0,
        foodEaten: 0,
        ticksSinceLastMeal: 0,
    };
}

// ============================================================================
// Grass Behavior
// ============================================================================

/**
 * Result of updating a grass entity.
 */
export interface GrassUpdateResult {
    /** Whether the grass is still alive */
    alive: boolean;
    /** New grass entity spawned via spreading (if any) */
    spawn: GrassEntity | null;
}

/**
 * Probabilistic old age death check.
 * Starting at 80% of life expectancy, the chance of dying increases linearly,
 * reaching 100% at 120% of life expectancy.
 */
function shouldDieOfOldAge(age: number, lifeExpectancy: number): boolean {
    const minAge = lifeExpectancy * 0.8;
    if (age < minAge) return false;
    const maxAge = lifeExpectancy * 1.2;
    if (age >= maxAge) return true;
    const chance = (age - minAge) / (maxAge - minAge);
    return Math.random() < chance;
}

/**
 * Updates a grass entity for one tick.
 * 
 * Grass behavior:
 * - Ages each tick
 * - Dies when reaching life expectancy
 * - May spread to adjacent empty cells based on spread rate
 * 
 * @param grass - The grass entity to update
 * @param grid - The simulation grid
 * @param config - Simulation configuration
 * @returns Update result with survival status and potential spawn
 */
export function updateGrass(
    grass: GrassEntity,
    grid: Grid,
    config: SimulationConfig
): GrassUpdateResult {
    // Age the grass
    grass.age++;

    // Check for death by old age (probabilistic around life expectancy)
    if (shouldDieOfOldAge(grass.age, config.grass.lifeExpectancy)) {
        return { alive: false, spawn: null };
    }

    // Attempt to spread to a cell within spread radius
    let spawn: GrassEntity | null = null;

    // Spread rate is a percentage chance per tick
    if (Math.random() * 100 < config.grass.spreadRate) {
        const emptyCell = grid.getRandomEmptyInRadius(grass.x, grass.y, config.grass.spreadRadius);
        if (emptyCell) {
            spawn = createGrass(emptyCell.x, emptyCell.y);
        }
    }

    return { alive: true, spawn };
}

// ============================================================================
// Sheep Behavior
// ============================================================================

/**
 * Result of updating a sheep entity.
 */
export interface SheepUpdateResult {
    /** Whether the sheep is still alive */
    alive: boolean;
    /** New sheep entity spawned via breeding (if any) */
    spawn: SheepEntity | null;
    /** Position of grass that was eaten (if any) */
    ateGrassAt: { x: number; y: number } | null;
}

/**
 * Updates a sheep entity for one tick.
 * 
 * Sheep behavior:
 * - Ages each tick
 * - Dies when reaching life expectancy or starving
 * - Moves randomly (prefers cells with grass)
 * - Eats grass when on grass cell
 * - Breeds when enough grass has been eaten
 * 
 * @param sheep - The sheep entity to update
 * @param grid - The simulation grid
 * @param config - Simulation configuration
 * @returns Update result with survival status, potential spawn, and eaten grass
 */
export function updateSheep(
    sheep: SheepEntity,
    grid: Grid,
    config: SimulationConfig
): SheepUpdateResult {
    // Age the sheep
    sheep.age++;
    sheep.ticksSinceLastMeal++;

    // Check for death by old age (probabilistic around life expectancy)
    if (shouldDieOfOldAge(sheep.age, config.sheep.lifeExpectancy)) {
        return { alive: false, spawn: null, ateGrassAt: null };
    }

    // Check for death by starvation
    if (sheep.ticksSinceLastMeal >= config.sheep.starvationTime) {
        return { alive: false, spawn: null, ateGrassAt: null };
    }

    let ateGrassAt: { x: number; y: number } | null = null;
    let spawn: SheepEntity | null = null;

    // Get all valid neighboring positions
    const neighbors = grid.getNeighborPositions(sheep.x, sheep.y);

    // Separate neighbors by type
    const grassNeighbors = neighbors.filter(
        pos => grid.getType(pos.x, pos.y) === EntityType.GRASS
    );
    const emptyNeighbors = neighbors.filter(
        pos => grid.getType(pos.x, pos.y) === EntityType.EMPTY
    );

    // Old position for movement
    const oldX = sheep.x;
    const oldY = sheep.y;

    // Priority: eat adjacent grass > move toward detected grass > wander randomly
    if (grassNeighbors.length > 0) {
        // Move to a grass cell
        const target = grassNeighbors[Math.floor(Math.random() * grassNeighbors.length)];
        sheep.x = target.x;
        sheep.y = target.y;

        // Eat the grass
        ateGrassAt = { x: target.x, y: target.y };
        sheep.foodEaten++;
        sheep.ticksSinceLastMeal = 0;

        // Check for breeding
        if (sheep.foodEaten >= config.sheep.breedThreshold) {
            sheep.foodEaten = 0;

            // Try to spawn offspring in old position or nearby empty cell
            const spawnPos = grid.getType(oldX, oldY) === EntityType.EMPTY
                ? { x: oldX, y: oldY }
                : grid.getRandomEmptyNeighbor(sheep.x, sheep.y);

            if (spawnPos) {
                spawn = createSheep(spawnPos.x, spawnPos.y);
            }
        }
    } else {
        // No adjacent grass — look for grass within grazing radius
        const closestGrass = grid.findClosestInRadius<GrassEntity>(
            sheep.x, sheep.y,
            config.sheep.grazingRadius,
            EntityType.GRASS
        );

        if (closestGrass) {
            // Move one step toward the detected grass
            const dx = Math.sign(closestGrass.entity.x - sheep.x);
            const dy = Math.sign(closestGrass.entity.y - sheep.y);
            const newX = sheep.x + dx;
            const newY = sheep.y + dy;

            if (grid.isValidPosition(newX, newY)) {
                const targetType = grid.getType(newX, newY);
                if (targetType === EntityType.GRASS) {
                    // Reached grass — eat it
                    sheep.x = newX;
                    sheep.y = newY;
                    ateGrassAt = { x: newX, y: newY };
                    sheep.foodEaten++;
                    sheep.ticksSinceLastMeal = 0;

                    if (sheep.foodEaten >= config.sheep.breedThreshold) {
                        sheep.foodEaten = 0;
                        const spawnPos = grid.getType(oldX, oldY) === EntityType.EMPTY
                            ? { x: oldX, y: oldY }
                            : grid.getRandomEmptyNeighbor(sheep.x, sheep.y);
                        if (spawnPos) {
                            spawn = createSheep(spawnPos.x, spawnPos.y);
                        }
                    }
                } else if (targetType === EntityType.EMPTY) {
                    // Move toward grass
                    sheep.x = newX;
                    sheep.y = newY;
                }
            }
        } else if (emptyNeighbors.length > 0) {
            // No grass detected at all — wander randomly
            const target = emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
            sheep.x = target.x;
            sheep.y = target.y;
        }
    }
    // If no valid moves, sheep stays in place

    return { alive: true, spawn, ateGrassAt };
}

// ============================================================================
// Wolf Behavior
// ============================================================================

/**
 * Result of updating a wolf entity.
 */
export interface WolfUpdateResult {
    /** Whether the wolf is still alive */
    alive: boolean;
    /** New wolf entity spawned via breeding (if any) */
    spawn: WolfEntity | null;
    /** Position of sheep that was eaten (if any) */
    ateSheepAt: { x: number; y: number } | null;
}

/**
 * Updates a wolf entity for one tick.
 * 
 * Wolf behavior:
 * - Ages each tick
 * - Dies when reaching life expectancy or starving
 * - Hunts sheep within hunting radius (moves towards closest sheep)
 * - Eats sheep when on same cell as sheep
 * - Breeds when enough sheep have been eaten
 * 
 * @param wolf - The wolf entity to update
 * @param grid - The simulation grid
 * @param config - Simulation configuration
 * @returns Update result with survival status, potential spawn, and eaten sheep
 */
export function updateWolf(
    wolf: WolfEntity,
    grid: Grid,
    config: SimulationConfig
): WolfUpdateResult {
    // Age the wolf
    wolf.age++;
    wolf.ticksSinceLastMeal++;

    // Check for death by old age (probabilistic around life expectancy)
    if (shouldDieOfOldAge(wolf.age, config.wolf.lifeExpectancy)) {
        return { alive: false, spawn: null, ateSheepAt: null };
    }

    // Check for death by starvation
    if (wolf.ticksSinceLastMeal >= config.wolf.starvationTime) {
        return { alive: false, spawn: null, ateSheepAt: null };
    }

    let ateSheepAt: { x: number; y: number } | null = null;
    let spawn: WolfEntity | null = null;

    const oldX = wolf.x;
    const oldY = wolf.y;

    // Look for sheep within hunting radius
    const closestSheep = grid.findClosestInRadius<SheepEntity>(
        wolf.x,
        wolf.y,
        config.wolf.huntingRadius,
        EntityType.SHEEP
    );

    if (closestSheep) {
        // Move towards the sheep
        const sheep = closestSheep.entity;
        const dx = Math.sign(sheep.x - wolf.x);
        const dy = Math.sign(sheep.y - wolf.y);

        const newX = wolf.x + dx;
        const newY = wolf.y + dy;

        // Check if we can move there
        if (grid.isValidPosition(newX, newY)) {
            const targetType = grid.getType(newX, newY);

            if (targetType === EntityType.SHEEP) {
                // Eat the sheep!
                wolf.x = newX;
                wolf.y = newY;
                ateSheepAt = { x: newX, y: newY };
                wolf.foodEaten++;
                wolf.ticksSinceLastMeal = 0;

                // Check for breeding
                if (wolf.foodEaten >= config.wolf.breedThreshold) {
                    wolf.foodEaten = 0;

                    const spawnPos = grid.getType(oldX, oldY) === EntityType.EMPTY
                        ? { x: oldX, y: oldY }
                        : grid.getRandomEmptyNeighbor(wolf.x, wolf.y);

                    if (spawnPos) {
                        spawn = createWolf(spawnPos.x, spawnPos.y);
                    }
                }
            } else if (targetType === EntityType.EMPTY || targetType === EntityType.GRASS) {
                // Move towards sheep (can walk over grass)
                wolf.x = newX;
                wolf.y = newY;
            }
        }
    } else {
        // No sheep nearby, move randomly
        const neighbors = grid.getNeighborPositions(wolf.x, wolf.y);
        const validMoves = neighbors.filter(pos => {
            const type = grid.getType(pos.x, pos.y);
            return type === EntityType.EMPTY || type === EntityType.GRASS || type === EntityType.SHEEP;
        });

        if (validMoves.length > 0) {
            const target = validMoves[Math.floor(Math.random() * validMoves.length)];

            if (grid.getType(target.x, target.y) === EntityType.SHEEP) {
                // Lucky find - eat the sheep
                wolf.x = target.x;
                wolf.y = target.y;
                ateSheepAt = { x: target.x, y: target.y };
                wolf.foodEaten++;
                wolf.ticksSinceLastMeal = 0;

                if (wolf.foodEaten >= config.wolf.breedThreshold) {
                    wolf.foodEaten = 0;
                    const spawnPos = grid.getType(oldX, oldY) === EntityType.EMPTY
                        ? { x: oldX, y: oldY }
                        : grid.getRandomEmptyNeighbor(wolf.x, wolf.y);

                    if (spawnPos) {
                        spawn = createWolf(spawnPos.x, spawnPos.y);
                    }
                }
            } else {
                wolf.x = target.x;
                wolf.y = target.y;
            }
        }
    }

    return { alive: true, spawn, ateSheepAt };
}

// ============================================================================
// Population Seeding
// ============================================================================

/**
 * Seeds the grid with initial populations based on configuration.
 * Places entities at random positions avoiding overlaps.
 * 
 * @param grid - The simulation grid to seed
 * @param config - Simulation configuration with initial counts
 */
export function seedPopulation(grid: Grid, config: SimulationConfig): void {
    // Clear existing entities
    grid.reset();

    // Seed grass
    for (let i = 0; i < config.grass.initialCount; i++) {
        const pos = grid.getRandomEmptyPosition();
        if (pos) {
            const grass = createGrass(pos.x, pos.y);
            grid.set(pos.x, pos.y, grass);
        }
    }

    // Seed sheep
    for (let i = 0; i < config.sheep.initialCount; i++) {
        const pos = grid.getRandomEmptyPosition();
        if (pos) {
            const sheep = createSheep(pos.x, pos.y);
            grid.set(pos.x, pos.y, sheep);
        }
    }

    // Seed wolves
    for (let i = 0; i < config.wolf.initialCount; i++) {
        const pos = grid.getRandomEmptyPosition();
        if (pos) {
            const wolf = createWolf(pos.x, pos.y);
            grid.set(pos.x, pos.y, wolf);
        }
    }
}
