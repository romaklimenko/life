/**
 * Life Ecosystem Simulation - Simulation Engine
 * 
 * The main engine that orchestrates the simulation.
 * Handles the game loop, entity updates, and state management.
 */

import {
    EntityType,
    GrassEntity,
    SheepEntity,
    WolfEntity,
    SimulationConfig,
    SimulationState,
    PopulationCounts,
    PopulationDataPoint,
} from '../types';
import { Grid } from './grid';
import {
    updateGrass,
    updateSheep,
    updateWolf,
    seedPopulation,
} from './entities';

/** Maximum history points to keep for charting */
const MAX_HISTORY_LENGTH = 500;

/** How often to record history (every N ticks) */
const HISTORY_INTERVAL = 1;

/**
 * SimulationEngine orchestrates the ecosystem simulation.
 * 
 * Responsibilities:
 * - Initialize and seed the grid
 * - Process entity updates each tick
 * - Track population statistics
 * - Manage simulation state (running/paused)
 */
export class SimulationEngine {
    /** The simulation grid */
    private grid: Grid;

    /** Current configuration */
    private config: SimulationConfig;

    /** Current simulation state */
    private state: SimulationState;

    /** Whether the simulation has ended due to extinction */
    private isGameOver = false;

    /** Which population went extinct (if any) */
    private extinctPopulation: 'grass' | 'sheep' | 'wolves' | null = null;

    /**
     * Creates a new simulation engine.
     * @param config - Initial configuration
     */
    constructor(config: SimulationConfig) {
        this.grid = new Grid();
        this.config = { ...config };
        this.state = {
            tick: 0,
            isRunning: false,
            population: { grass: 0, sheep: 0, wolves: 0 },
            history: [],
        };
    }

    // ==========================================================================
    // Initialization
    // ==========================================================================

    /**
     * Initializes the simulation with the current configuration.
     * Seeds the grid with initial populations.
     */
    initialize(): void {
        this.isGameOver = false;
        this.extinctPopulation = null;
        seedPopulation(this.grid, this.config);
        this.state.tick = 0;
        this.state.history = [];
        this.updatePopulationCounts();
        this.recordHistory();
    }

    /**
     * Resets the simulation to initial state with new configuration.
     * @param config - New configuration to use
     */
    reset(config?: SimulationConfig): void {
        if (config) {
            this.config = { ...config };
        }
        this.state.isRunning = false;
        this.initialize();
    }

    // ==========================================================================
    // State Management
    // ==========================================================================

    /**
     * Gets the current simulation state.
     */
    getState(): SimulationState {
        return { ...this.state };
    }

    /**
     * Gets the raw grid for rendering.
     */
    getGrid(): Grid {
        return this.grid;
    }

    /**
     * Gets the current configuration.
     */
    getConfig(): SimulationConfig {
        return { ...this.config };
    }

    /**
     * Updates the game speed.
     * @param speed - New speed in ticks per second
     */
    setGameSpeed(speed: number): void {
        this.config.gameSpeed = speed;
    }

    /**
     * Starts the simulation.
     */
    start(): void {
        this.state.isRunning = true;
    }

    /**
     * Pauses the simulation.
     */
    pause(): void {
        this.state.isRunning = false;
    }

    /**
     * Toggles simulation running state.
     */
    togglePause(): void {
        this.state.isRunning = !this.state.isRunning;
    }

    /**
     * Returns whether the simulation is running.
     */
    isRunning(): boolean {
        return this.state.isRunning;
    }

    // ==========================================================================
    // Simulation Loop
    // ==========================================================================

    /**
     * Advances the simulation by one tick.
     * Processes all entities in order: grass, sheep, wolves.
     * 
     * Processing order matters:
     * 1. Grass spreads and dies
     * 2. Sheep move, eat grass, breed
     * 3. Wolves hunt, eat sheep, breed
     */
    tick(): void {
        this.state.tick++;

        // Collect entities to process (snapshot to avoid modification during iteration)
        const allGrass = this.grid.getEntitiesOfType<GrassEntity>(EntityType.GRASS);
        const allSheep = this.grid.getEntitiesOfType<SheepEntity>(EntityType.SHEEP);
        const allWolves = this.grid.getEntitiesOfType<WolfEntity>(EntityType.WOLF);

        // Process grass
        const newGrass: GrassEntity[] = [];
        for (const grass of allGrass) {
            const result = updateGrass(grass, this.grid, this.config);

            if (!result.alive) {
                // Grass died
                this.grid.clear(grass.x, grass.y);
            } else {
                // Update grass in grid
                this.grid.set(grass.x, grass.y, grass);

                // Spawn new grass if spreading
                if (result.spawn) {
                    newGrass.push(result.spawn);
                }
            }
        }

        // Add newly spawned grass
        for (const grass of newGrass) {
            if (this.grid.getType(grass.x, grass.y) === EntityType.EMPTY) {
                this.grid.set(grass.x, grass.y, grass);
            }
        }

        // Process sheep
        const newSheep: SheepEntity[] = [];
        const processedSheepPositions = new Set<string>();

        for (const sheep of allSheep) {
            // Skip if already eaten by another sheep (rare edge case)
            const key = `${sheep.x},${sheep.y}`;
            if (processedSheepPositions.has(key)) continue;

            const oldX = sheep.x;
            const oldY = sheep.y;
            const result = updateSheep(sheep, this.grid, this.config);

            // Clear old position if sheep moved or died
            if (!result.alive || sheep.x !== oldX || sheep.y !== oldY) {
                this.grid.clear(oldX, oldY);
            }

            if (!result.alive) {
                // Sheep died - already cleared
            } else {
                // Update sheep in new position
                // Check if position is occupied by a wolf (eaten)
                if (this.grid.getType(sheep.x, sheep.y) !== EntityType.WOLF) {
                    this.grid.set(sheep.x, sheep.y, sheep);
                    processedSheepPositions.add(`${sheep.x},${sheep.y}`);
                }

                // Handle eaten grass
                if (result.ateGrassAt) {
                    // Grass is replaced by sheep, already handled by set()
                }

                // Spawn offspring
                if (result.spawn) {
                    newSheep.push(result.spawn);
                }
            }
        }

        // Add newly born sheep
        for (const sheep of newSheep) {
            if (this.grid.getType(sheep.x, sheep.y) === EntityType.EMPTY) {
                this.grid.set(sheep.x, sheep.y, sheep);
            }
        }

        // Process wolves
        const newWolves: WolfEntity[] = [];

        for (const wolf of allWolves) {
            const oldX = wolf.x;
            const oldY = wolf.y;
            const result = updateWolf(wolf, this.grid, this.config);

            // Clear old position if wolf moved or died
            if (!result.alive || wolf.x !== oldX || wolf.y !== oldY) {
                this.grid.clear(oldX, oldY);
            }

            if (!result.alive) {
                // Wolf died - already cleared
            } else {
                // Update wolf in new position
                this.grid.set(wolf.x, wolf.y, wolf);

                // Handle eaten sheep - sheep is replaced, already cleared when wolf moves there
                if (result.ateSheepAt) {
                    // The sheep was at the wolf's new position, which is now the wolf
                }

                // Spawn offspring
                if (result.spawn) {
                    newWolves.push(result.spawn);
                }
            }
        }

        // Add newly born wolves
        for (const wolf of newWolves) {
            if (this.grid.getType(wolf.x, wolf.y) === EntityType.EMPTY) {
                this.grid.set(wolf.x, wolf.y, wolf);
            }
        }

        // Update population counts
        this.updatePopulationCounts();

        // Check for extinction - game ends if any population reaches zero
        this.checkExtinction();

        // Record history periodically
        if (this.state.tick % HISTORY_INTERVAL === 0) {
            this.recordHistory();
        }
    }

    /**
     * Checks if any population has gone extinct and ends the game if so.
     */
    private checkExtinction(): void {
        const { grass, sheep, wolves } = this.state.population;

        if (grass === 0) {
            this.isGameOver = true;
            this.extinctPopulation = 'grass';
            this.state.isRunning = false;
        } else if (sheep === 0) {
            this.isGameOver = true;
            this.extinctPopulation = 'sheep';
            this.state.isRunning = false;
        } else if (wolves === 0) {
            this.isGameOver = true;
            this.extinctPopulation = 'wolves';
            this.state.isRunning = false;
        }
    }

    /**
     * Returns whether the simulation has ended due to extinction.
     */
    hasEnded(): boolean {
        return this.isGameOver;
    }

    /**
     * Returns which population went extinct, or null if still running.
     */
    getExtinctPopulation(): 'grass' | 'sheep' | 'wolves' | null {
        return this.extinctPopulation;
    }

    // ==========================================================================
    // Statistics
    // ==========================================================================

    /**
     * Updates the population counts from the grid.
     */
    private updatePopulationCounts(): void {
        this.state.population = this.grid.getCounts();
    }

    /**
     * Records current population to history.
     */
    private recordHistory(): void {
        const dataPoint: PopulationDataPoint = {
            tick: this.state.tick,
            ...this.state.population,
        };

        this.state.history.push(dataPoint);

        // Trim history if too long
        if (this.state.history.length > MAX_HISTORY_LENGTH) {
            this.state.history.shift();
        }
    }

    /**
     * Gets current population counts.
     */
    getPopulationCounts(): PopulationCounts {
        return { ...this.state.population };
    }

    /**
     * Gets population history for charting.
     */
    getHistory(): PopulationDataPoint[] {
        return [...this.state.history];
    }

    /**
     * Gets the current tick number.
     */
    getTick(): number {
        return this.state.tick;
    }
}
