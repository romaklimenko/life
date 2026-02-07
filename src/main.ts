/**
 * Life - Ecosystem Simulation
 * Main Entry Point
 * 
 * This file bootstraps the application and connects all components:
 * - Simulation engine
 * - Canvas renderer
 * - Population chart
 * - UI controls
 * - Game loop
 */

import './styles/index.css';
import { SimulationConfig } from './types';
import { SimulationEngine } from './simulation/engine';
import { Renderer } from './rendering/canvas';
import { PopulationChart } from './chart/chart';
import { StartScreenController, SimulationControls, showScreen } from './ui/controls';

// ============================================================================
// Application State
// ============================================================================

/** The simulation engine instance */
let engine: SimulationEngine | null = null;

/** The canvas renderer instance */
let renderer: Renderer | null = null;

/** The population chart instance */
let chart: PopulationChart | null = null;

/** The simulation controls instance */
let controls: SimulationControls | null = null;

/** Animation frame ID for the game loop */
let animationFrameId: number | null = null;

/** Last tick timestamp for timing */
let lastTickTime = 0;

// ============================================================================
// Game Loop
// ============================================================================

/**
 * The main game loop.
 * Handles timing, simulation ticks, and rendering.
 */
function gameLoop(timestamp: number): void {
    if (!engine || !renderer || !chart || !controls) {
        return;
    }

    // Calculate time since last tick
    const tickInterval = 1000 / engine.getConfig().gameSpeed;

    if (engine.isRunning() && timestamp - lastTickTime >= tickInterval) {
        // Run simulation tick
        engine.tick();
        lastTickTime = timestamp;

        // Update displays
        const counts = engine.getPopulationCounts();
        controls.updateStats(counts.grass, counts.sheep, counts.wolves, engine.getTick());
    }

    // Always render (even when paused)
    renderer.render(engine.getGrid());
    chart.render(engine.getHistory());

    // Schedule next frame
    animationFrameId = requestAnimationFrame(gameLoop);
}

/**
 * Starts the game loop.
 */
function startGameLoop(): void {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
    }
    lastTickTime = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
}

/**
 * Stops the game loop.
 */
function stopGameLoop(): void {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// ============================================================================
// Simulation Control Handlers
// ============================================================================

/**
 * Handles starting the simulation from the start screen.
 */
function handleStart(config: SimulationConfig): void {
    console.log('Starting simulation with config:', config);

    // Create simulation engine
    engine = new SimulationEngine(config);
    engine.initialize();

    // Create renderer
    const gridCanvas = document.getElementById('grid-canvas') as HTMLCanvasElement;
    renderer = new Renderer(gridCanvas);

    // Create chart
    const chartCanvas = document.getElementById('chart-canvas') as HTMLCanvasElement;
    chart = new PopulationChart({ canvas: chartCanvas });

    // Create controls
    controls = new SimulationControls(
        // Pause/Resume
        () => {
            if (engine) {
                engine.togglePause();
            }
        },
        // Reset
        () => {
            stopGameLoop();
            showScreen('start-screen');
        },
        // Speed change
        (speed: number) => {
            if (engine) {
                engine.setGameSpeed(speed);
            }
        }
    );
    controls.setSpeed(config.gameSpeed);

    // Initial stats display
    const counts = engine.getPopulationCounts();
    controls.updateStats(counts.grass, counts.sheep, counts.wolves, 0);

    // Show simulation screen and start
    showScreen('simulation-screen');
    engine.start();
    startGameLoop();
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the application when DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌿 Life Ecosystem Simulation');
    console.log('Initializing...');

    // Create start screen controller
    new StartScreenController(handleStart);

    // Show start screen
    showScreen('start-screen');

    console.log('Ready! Configure parameters and click Start.');
});
