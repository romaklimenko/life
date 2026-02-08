/**
 * Life Ecosystem Simulation - Grid Data Structure
 * 
 * Implements a 255x255 grid for storing entity positions.
 * Uses typed arrays for efficient memory usage and fast lookups.
 * Each cell stores an entity type ID, with full entity data stored separately.
 */

import {
    EntityType,
    Entity,
    GRID_WIDTH,
    GRID_HEIGHT,
    GRID_SIZE,
    DIRECTIONS,
    CARDINAL_DIRECTIONS,
} from '../types';

/**
 * Grid class for managing entity positions in the simulation.
 * 
 * The grid uses two data structures:
 * 1. A Uint8Array for fast cell type lookups (255x255 = 65025 bytes)
 * 2. A Map for storing full entity data by position key
 * 
 * This hybrid approach allows O(1) lookups for both empty cell checks
 * and full entity data retrieval.
 */
export class Grid {
    /** Type-only grid for fast lookups (0 = empty, 1 = grass, 2 = sheep, 3 = wolf) */
    private typeGrid: Uint8Array;

    /** Full entity data indexed by position key "x,y" */
    private entities: Map<string, Entity>;

    constructor() {
        this.typeGrid = new Uint8Array(GRID_SIZE);
        this.entities = new Map();
    }

    // ==========================================================================
    // Core Operations
    // ==========================================================================

    /**
     * Converts x,y coordinates to a flat array index.
     * @param x - X coordinate (0-254)
     * @param y - Y coordinate (0-254)
     * @returns Flat index for typeGrid array
     */
    private toIndex(x: number, y: number): number {
        return y * GRID_WIDTH + x;
    }

    /**
     * Converts x,y coordinates to a string key for entity map.
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns String key "x,y"
     */
    private toKey(x: number, y: number): string {
        return `${x},${y}`;
    }

    /**
     * Checks if coordinates are within grid bounds.
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns True if coordinates are valid
     */
    isValidPosition(x: number, y: number): boolean {
        return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
    }

    /**
     * Gets the entity type at a position without full entity data.
     * Fast O(1) lookup using typed array.
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns Entity type at position, or EMPTY if out of bounds
     */
    getType(x: number, y: number): EntityType {
        if (!this.isValidPosition(x, y)) {
            return EntityType.EMPTY;
        }
        return this.typeGrid[this.toIndex(x, y)] as EntityType;
    }

    /**
     * Gets the full entity data at a position.
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns Entity at position, or null if empty/out of bounds
     */
    get(x: number, y: number): Entity {
        if (!this.isValidPosition(x, y)) {
            return null;
        }
        return this.entities.get(this.toKey(x, y)) ?? null;
    }

    /**
     * Sets an entity at a position.
     * Updates both the type grid and entity map.
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param entity - Entity to place, or null to clear
     */
    set(x: number, y: number, entity: Entity): void {
        if (!this.isValidPosition(x, y)) {
            return;
        }

        const index = this.toIndex(x, y);
        const key = this.toKey(x, y);

        if (entity === null) {
            this.typeGrid[index] = EntityType.EMPTY;
            this.entities.delete(key);
        } else {
            this.typeGrid[index] = entity.type;
            this.entities.set(key, entity);
        }
    }

    /**
     * Clears an entity at a position.
     * Convenience method equivalent to set(x, y, null).
     * @param x - X coordinate
     * @param y - Y coordinate
     */
    clear(x: number, y: number): void {
        this.set(x, y, null);
    }

    /**
     * Clears all entities from the grid.
     */
    reset(): void {
        this.typeGrid.fill(EntityType.EMPTY);
        this.entities.clear();
    }

    // ==========================================================================
    // Neighbor & Radius Queries
    // ==========================================================================

    /**
     * Gets all 8 neighboring positions (including diagonals).
     * Filters out positions that are outside grid bounds.
     * @param x - Center X coordinate
     * @param y - Center Y coordinate
     * @returns Array of valid neighboring positions
     */
    getNeighborPositions(x: number, y: number): Array<{ x: number; y: number }> {
        const neighbors: Array<{ x: number; y: number }> = [];

        for (const dir of DIRECTIONS) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            if (this.isValidPosition(nx, ny)) {
                neighbors.push({ x: nx, y: ny });
            }
        }

        return neighbors;
    }

    /**
     * Gets 4 cardinal neighboring positions (no diagonals).
     * Used for grass spreading.
     * @param x - Center X coordinate
     * @param y - Center Y coordinate
     * @returns Array of valid cardinal neighbor positions
     */
    getCardinalNeighborPositions(x: number, y: number): Array<{ x: number; y: number }> {
        const neighbors: Array<{ x: number; y: number }> = [];

        for (const dir of CARDINAL_DIRECTIONS) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            if (this.isValidPosition(nx, ny)) {
                neighbors.push({ x: nx, y: ny });
            }
        }

        return neighbors;
    }

    /**
     * Gets all empty cells adjacent to the given position.
     * @param x - Center X coordinate
     * @param y - Center Y coordinate
     * @param useDiagonals - Whether to include diagonal neighbors
     * @returns Array of empty neighboring positions
     */
    getEmptyNeighbors(x: number, y: number, useDiagonals = true): Array<{ x: number; y: number }> {
        const neighbors = useDiagonals
            ? this.getNeighborPositions(x, y)
            : this.getCardinalNeighborPositions(x, y);

        return neighbors.filter(pos => this.getType(pos.x, pos.y) === EntityType.EMPTY);
    }

    /**
     * Finds all entities of a specific type within a radius.
     * Uses Manhattan distance for radius calculation (efficient for game logic).
     * @param x - Center X coordinate
     * @param y - Center Y coordinate
     * @param radius - Search radius in cells
     * @param entityType - Type of entity to find
     * @returns Array of entities found within radius
     */
    findInRadius<T extends Entity>(
        x: number,
        y: number,
        radius: number,
        entityType: EntityType
    ): T[] {
        const found: T[] = [];

        // Scan square area around center
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;

                // Skip if out of bounds
                if (!this.isValidPosition(nx, ny)) continue;

                // Skip center
                if (dx === 0 && dy === 0) continue;

                // Check Manhattan distance (taxicab distance)
                if (Math.abs(dx) + Math.abs(dy) > radius) continue;

                // Check entity type
                if (this.getType(nx, ny) === entityType) {
                    const entity = this.get(nx, ny);
                    if (entity) {
                        found.push(entity as T);
                    }
                }
            }
        }

        return found;
    }

    /**
     * Finds the closest entity of a specific type within a radius.
     * Uses Manhattan distance.
     * @param x - Center X coordinate
     * @param y - Center Y coordinate
     * @param radius - Search radius in cells
     * @param entityType - Type of entity to find
     * @returns Closest entity and its distance, or null if none found
     */
    findClosestInRadius<T extends Entity>(
        x: number,
        y: number,
        radius: number,
        entityType: EntityType
    ): { entity: T; distance: number } | null {
        let closest: { entity: T; distance: number } | null = null;

        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;

                if (!this.isValidPosition(nx, ny)) continue;
                if (dx === 0 && dy === 0) continue;

                const distance = Math.abs(dx) + Math.abs(dy);
                if (distance > radius) continue;

                if (this.getType(nx, ny) === entityType) {
                    if (!closest || distance < closest.distance) {
                        const entity = this.get(nx, ny);
                        if (entity) {
                            closest = { entity: entity as T, distance };
                        }
                    }
                }
            }
        }

        return closest;
    }

    // ==========================================================================
    // Iteration & Statistics
    // ==========================================================================

    /**
     * Gets all entities of a specific type.
     * @param entityType - Type of entities to retrieve
     * @returns Array of entities of the specified type
     */
    getEntitiesOfType<T extends Entity>(entityType: EntityType): T[] {
        const results: T[] = [];

        for (const entity of this.entities.values()) {
            if (entity && entity.type === entityType) {
                results.push(entity as T);
            }
        }

        return results;
    }

    /**
     * Gets all entities in the grid.
     * @returns Array of all non-null entities
     */
    getAllEntities(): Entity[] {
        return Array.from(this.entities.values()).filter(e => e !== null);
    }

    /**
     * Counts entities of each type.
     * @returns Object with counts for each entity type
     */
    getCounts(): { grass: number; sheep: number; wolves: number } {
        let grass = 0;
        let sheep = 0;
        let wolves = 0;

        for (let i = 0; i < GRID_SIZE; i++) {
            const type = this.typeGrid[i];
            if (type === EntityType.GRASS) grass++;
            else if (type === EntityType.SHEEP) sheep++;
            else if (type === EntityType.WOLF) wolves++;
        }

        return { grass, sheep, wolves };
    }

    /**
     * Gets the raw type grid for efficient rendering.
     * @returns Reference to the internal Uint8Array
     */
    getTypeGrid(): Uint8Array {
        return this.typeGrid;
    }

    // ==========================================================================
    // Random Position Helpers
    // ==========================================================================

    /**
     * Gets a random empty position on the grid.
     * Returns null if no empty positions exist (very unlikely on 255x255 grid).
     * @param maxAttempts - Maximum attempts before giving up
     * @returns Random empty position or null
     */
    getRandomEmptyPosition(maxAttempts = 100): { x: number; y: number } | null {
        for (let i = 0; i < maxAttempts; i++) {
            const x = Math.floor(Math.random() * GRID_WIDTH);
            const y = Math.floor(Math.random() * GRID_HEIGHT);

            if (this.getType(x, y) === EntityType.EMPTY) {
                return { x, y };
            }
        }

        return null;
    }

    /**
     * Gets a random empty neighbor of a position.
     * Used for spawning new entities near parents.
     * @param x - Center X coordinate
     * @param y - Center Y coordinate
     * @returns Random empty neighbor position or null if none available
     */
    /**
     * Gets a random empty cell within a given radius (Manhattan distance).
     * Uses random sampling for efficiency.
     * @param cx - Center X coordinate
     * @param cy - Center Y coordinate
     * @param radius - Search radius in cells (Manhattan distance)
     * @returns Random empty position within radius, or null if none found
     */
    getRandomEmptyInRadius(cx: number, cy: number, radius: number): { x: number; y: number } | null {
        // For radius 1, fall back to neighbor check for efficiency
        if (radius <= 1) {
            return this.getRandomEmptyNeighbor(cx, cy);
        }

        // Random sampling: try random positions within the diamond
        const maxAttempts = radius * radius * 2;
        for (let i = 0; i < maxAttempts; i++) {
            // Generate random point within Manhattan distance
            const dx = Math.floor(Math.random() * (2 * radius + 1)) - radius;
            const maxDy = radius - Math.abs(dx);
            const dy = Math.floor(Math.random() * (2 * maxDy + 1)) - maxDy;

            if (dx === 0 && dy === 0) continue;

            const nx = cx + dx;
            const ny = cy + dy;

            if (this.isValidPosition(nx, ny) && this.getType(nx, ny) === EntityType.EMPTY) {
                return { x: nx, y: ny };
            }
        }

        return null;
    }

    getRandomEmptyNeighbor(x: number, y: number): { x: number; y: number } | null {
        const emptyNeighbors = this.getEmptyNeighbors(x, y);

        if (emptyNeighbors.length === 0) {
            return null;
        }

        const index = Math.floor(Math.random() * emptyNeighbors.length);
        return emptyNeighbors[index];
    }
}
