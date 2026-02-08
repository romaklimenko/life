/**
 * Simulation Engine Integration Tests
 * 
 * Tests for the main simulation engine orchestration.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../engine';
import { SimulationConfig } from '../../types';

const testConfig: SimulationConfig = {
    grass: {
        lifeExpectancy: 50,
        initialCount: 100,
        spreadRate: 5,
        spreadRadius: 3,
    },
    sheep: {
        lifeExpectancy: 100,
        initialCount: 20,
        starvationTime: 20,
        breedThreshold: 3,
        grazingRadius: 3,
    },
    wolf: {
        lifeExpectancy: 150,
        initialCount: 5,
        starvationTime: 30,
        breedThreshold: 2,
        huntingRadius: 5,
    },
    gameSpeed: 10,
};

describe('SimulationEngine', () => {
    let engine: SimulationEngine;

    beforeEach(() => {
        engine = new SimulationEngine(testConfig);
    });

    describe('Initialization', () => {
        it('should create engine with config', () => {
            expect(engine.getConfig()).toEqual(testConfig);
        });

        it('should start with tick 0 and not running', () => {
            expect(engine.getTick()).toBe(0);
            expect(engine.isRunning()).toBe(false);
        });

        it('should initialize with population', () => {
            engine.initialize();

            const counts = engine.getPopulationCounts();
            expect(counts.grass).toBe(testConfig.grass.initialCount);
            expect(counts.sheep).toBe(testConfig.sheep.initialCount);
            expect(counts.wolves).toBe(testConfig.wolf.initialCount);
        });

        it('should have initial history point', () => {
            engine.initialize();

            const history = engine.getHistory();
            expect(history.length).toBe(1);
            expect(history[0].tick).toBe(0);
        });
    });

    describe('State Management', () => {
        it('should start simulation', () => {
            engine.start();
            expect(engine.isRunning()).toBe(true);
        });

        it('should pause simulation', () => {
            engine.start();
            engine.pause();
            expect(engine.isRunning()).toBe(false);
        });

        it('should toggle pause', () => {
            engine.togglePause();
            expect(engine.isRunning()).toBe(true);
            engine.togglePause();
            expect(engine.isRunning()).toBe(false);
        });

        it('should update game speed', () => {
            engine.setGameSpeed(30);
            expect(engine.getConfig().gameSpeed).toBe(30);
        });
    });

    describe('Simulation Tick', () => {
        it('should increment tick counter', () => {
            engine.initialize();
            engine.tick();
            expect(engine.getTick()).toBe(1);
        });

        it('should update population counts', () => {
            engine.initialize();

            // Run several ticks
            for (let i = 0; i < 10; i++) {
                engine.tick();
            }

            // Population should have changed (grass spreading, animals moving)
            const counts = engine.getPopulationCounts();
            const state = engine.getState();

            expect(state.tick).toBe(10);
            // Counts should be tracked
            expect(counts.grass).toBeGreaterThanOrEqual(0);
            expect(counts.sheep).toBeGreaterThanOrEqual(0);
            expect(counts.wolves).toBeGreaterThanOrEqual(0);
        });

        it('should record history', () => {
            engine.initialize();

            for (let i = 0; i < 5; i++) {
                engine.tick();
            }

            const history = engine.getHistory();
            expect(history.length).toBeGreaterThan(1);
        });
    });

    describe('Reset', () => {
        it('should reset to initial state', () => {
            engine.initialize();
            engine.start();

            for (let i = 0; i < 10; i++) {
                engine.tick();
            }

            engine.reset();

            expect(engine.getTick()).toBe(0);
            expect(engine.isRunning()).toBe(false);

            const counts = engine.getPopulationCounts();
            expect(counts.grass).toBe(testConfig.grass.initialCount);
        });

        it('should reset with new config', () => {
            engine.initialize();

            const newConfig: SimulationConfig = {
                ...testConfig,
                grass: { ...testConfig.grass, initialCount: 200 },
            };

            engine.reset(newConfig);

            const counts = engine.getPopulationCounts();
            expect(counts.grass).toBe(200);
        });
    });

    describe('Grid Access', () => {
        it('should provide grid for rendering', () => {
            engine.initialize();

            const grid = engine.getGrid();
            expect(grid).toBeDefined();

            const typeGrid = grid.getTypeGrid();
            expect(typeGrid).toBeInstanceOf(Uint8Array);
        });
    });
});
