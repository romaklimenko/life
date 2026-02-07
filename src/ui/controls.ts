/**
 * Life Ecosystem Simulation - UI Controls
 * 
 * Handles user interactions with the simulation:
 * - Start screen parameter configuration
 * - Preset selection
 * - Play/Pause/Reset controls
 * - Speed adjustment
 */

import { SimulationConfig } from '../types';
import { getPresetConfig, PresetId } from '../config/defaults';
import { sanitizeConfig } from '../config/validation';

// ============================================================================
// DOM Element References
// ============================================================================

/**
 * Gets an element by ID with type safety.
 */
function getElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element not found: ${id}`);
    }
    return element as T;
}

// ============================================================================
// Start Screen Controller
// ============================================================================

/**
 * Manages the start screen parameter configuration.
 */
export class StartScreenController {
    // Input elements
    private presetSelect: HTMLSelectElement;
    private grassLifespan: HTMLInputElement;
    private grassInitial: HTMLInputElement;
    private grassSpread: HTMLInputElement;
    private sheepLifespan: HTMLInputElement;
    private sheepInitial: HTMLInputElement;
    private sheepStarvation: HTMLInputElement;
    private sheepBreed: HTMLInputElement;
    private wolfLifespan: HTMLInputElement;
    private wolfInitial: HTMLInputElement;
    private wolfStarvation: HTMLInputElement;
    private wolfBreed: HTMLInputElement;
    private wolfHunting: HTMLInputElement;
    private gameSpeed: HTMLInputElement;
    private speedValue: HTMLSpanElement;
    private startBtn: HTMLButtonElement;

    private onStart: (config: SimulationConfig) => void;

    /**
     * Creates a new StartScreenController.
     * @param onStart - Callback when start button is clicked
     */
    constructor(onStart: (config: SimulationConfig) => void) {
        this.onStart = onStart;

        // Get DOM elements
        this.presetSelect = getElement<HTMLSelectElement>('preset-select');
        this.grassLifespan = getElement<HTMLInputElement>('grass-lifespan');
        this.grassInitial = getElement<HTMLInputElement>('grass-initial');
        this.grassSpread = getElement<HTMLInputElement>('grass-spread');
        this.sheepLifespan = getElement<HTMLInputElement>('sheep-lifespan');
        this.sheepInitial = getElement<HTMLInputElement>('sheep-initial');
        this.sheepStarvation = getElement<HTMLInputElement>('sheep-starvation');
        this.sheepBreed = getElement<HTMLInputElement>('sheep-breed');
        this.wolfLifespan = getElement<HTMLInputElement>('wolf-lifespan');
        this.wolfInitial = getElement<HTMLInputElement>('wolf-initial');
        this.wolfStarvation = getElement<HTMLInputElement>('wolf-starvation');
        this.wolfBreed = getElement<HTMLInputElement>('wolf-breed');
        this.wolfHunting = getElement<HTMLInputElement>('wolf-hunting');
        this.gameSpeed = getElement<HTMLInputElement>('game-speed');
        this.speedValue = getElement<HTMLSpanElement>('speed-value');
        this.startBtn = getElement<HTMLButtonElement>('start-btn');

        this.setupEventListeners();
        this.loadPreset('balanced');
    }

    /**
     * Sets up event listeners for user interactions.
     */
    private setupEventListeners(): void {
        // Preset selection
        this.presetSelect.addEventListener('change', () => {
            this.loadPreset(this.presetSelect.value as PresetId);
        });

        // Speed slider updates display
        this.gameSpeed.addEventListener('input', () => {
            this.speedValue.textContent = this.gameSpeed.value;
        });

        // Start button
        this.startBtn.addEventListener('click', () => {
            const config = this.getConfig();
            this.onStart(config);
        });
    }

    /**
     * Loads a preset's values into the form.
     */
    loadPreset(presetId: PresetId): void {
        const config = getPresetConfig(presetId);
        this.setFormValues(config);
    }

    /**
     * Sets all form values from a config.
     */
    private setFormValues(config: SimulationConfig): void {
        this.grassLifespan.value = config.grass.lifeExpectancy.toString();
        this.grassInitial.value = config.grass.initialCount.toString();
        this.grassSpread.value = config.grass.spreadRate.toString();
        this.sheepLifespan.value = config.sheep.lifeExpectancy.toString();
        this.sheepInitial.value = config.sheep.initialCount.toString();
        this.sheepStarvation.value = config.sheep.starvationTime.toString();
        this.sheepBreed.value = config.sheep.breedThreshold.toString();
        this.wolfLifespan.value = config.wolf.lifeExpectancy.toString();
        this.wolfInitial.value = config.wolf.initialCount.toString();
        this.wolfStarvation.value = config.wolf.starvationTime.toString();
        this.wolfBreed.value = config.wolf.breedThreshold.toString();
        this.wolfHunting.value = config.wolf.huntingRadius.toString();
        this.gameSpeed.value = config.gameSpeed.toString();
        this.speedValue.textContent = config.gameSpeed.toString();
    }

    /**
     * Gets the current configuration from form values.
     */
    getConfig(): SimulationConfig {
        const config: SimulationConfig = {
            grass: {
                lifeExpectancy: parseInt(this.grassLifespan.value, 10),
                initialCount: parseInt(this.grassInitial.value, 10),
                spreadRate: parseInt(this.grassSpread.value, 10),
            },
            sheep: {
                lifeExpectancy: parseInt(this.sheepLifespan.value, 10),
                initialCount: parseInt(this.sheepInitial.value, 10),
                starvationTime: parseInt(this.sheepStarvation.value, 10),
                breedThreshold: parseInt(this.sheepBreed.value, 10),
            },
            wolf: {
                lifeExpectancy: parseInt(this.wolfLifespan.value, 10),
                initialCount: parseInt(this.wolfInitial.value, 10),
                starvationTime: parseInt(this.wolfStarvation.value, 10),
                breedThreshold: parseInt(this.wolfBreed.value, 10),
                huntingRadius: parseInt(this.wolfHunting.value, 10),
            },
            gameSpeed: parseInt(this.gameSpeed.value, 10),
        };

        // Sanitize to ensure valid values
        return sanitizeConfig(config);
    }
}

// ============================================================================
// Simulation Controls
// ============================================================================

/**
 * Manages the simulation control buttons and speed slider.
 */
export class SimulationControls {
    private pauseBtn: HTMLButtonElement;
    private resetBtn: HTMLButtonElement;
    private speedSlider: HTMLInputElement;
    private speedValueDisplay: HTMLSpanElement;
    private grassCount: HTMLSpanElement;
    private sheepCount: HTMLSpanElement;
    private wolfCount: HTMLSpanElement;
    private tickCount: HTMLSpanElement;

    private isPaused = false;
    private onPauseToggle: () => void;
    private onReset: () => void;
    private onSpeedChange: (speed: number) => void;

    constructor(
        onPauseToggle: () => void,
        onReset: () => void,
        onSpeedChange: (speed: number) => void
    ) {
        this.onPauseToggle = onPauseToggle;
        this.onReset = onReset;
        this.onSpeedChange = onSpeedChange;

        // Get DOM elements
        this.pauseBtn = getElement<HTMLButtonElement>('pause-btn');
        this.resetBtn = getElement<HTMLButtonElement>('reset-btn');
        this.speedSlider = getElement<HTMLInputElement>('sim-speed');
        this.speedValueDisplay = getElement<HTMLSpanElement>('sim-speed-value');
        this.grassCount = getElement<HTMLSpanElement>('grass-count');
        this.sheepCount = getElement<HTMLSpanElement>('sheep-count');
        this.wolfCount = getElement<HTMLSpanElement>('wolf-count');
        this.tickCount = getElement<HTMLSpanElement>('tick-count');

        this.setupEventListeners();
    }

    /**
     * Sets up event listeners.
     */
    private setupEventListeners(): void {
        this.pauseBtn.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            this.updatePauseButton();
            this.onPauseToggle();
        });

        this.resetBtn.addEventListener('click', () => {
            this.onReset();
        });

        this.speedSlider.addEventListener('input', () => {
            const speed = parseInt(this.speedSlider.value, 10);
            this.speedValueDisplay.textContent = speed.toString();
            this.onSpeedChange(speed);
        });
    }

    /**
     * Updates the pause button text.
     */
    private updatePauseButton(): void {
        this.pauseBtn.textContent = this.isPaused ? '▶ Play' : '⏸ Pause';
    }

    /**
     * Sets the initial speed value.
     */
    setSpeed(speed: number): void {
        this.speedSlider.value = speed.toString();
        this.speedValueDisplay.textContent = speed.toString();
    }

    /**
     * Updates the population display.
     */
    updateStats(grass: number, sheep: number, wolves: number, tick: number): void {
        this.grassCount.textContent = grass.toLocaleString();
        this.sheepCount.textContent = sheep.toLocaleString();
        this.wolfCount.textContent = wolves.toLocaleString();
        this.tickCount.textContent = tick.toLocaleString();
    }

    /**
     * Resets to initial state.
     */
    reset(): void {
        this.isPaused = false;
        this.updatePauseButton();
        this.hideGameOver();
    }

    /**
     * Shows the game over message with extinction details.
     */
    showGameOver(extinctPopulation: 'grass' | 'sheep' | 'wolves' | null, finalTick: number): void {
        const gameOverEl = document.getElementById('game-over-message');
        if (!gameOverEl) return;

        const emoji = extinctPopulation === 'grass' ? '🌱' :
            extinctPopulation === 'sheep' ? '🐑' : '🐺';
        const name = extinctPopulation || 'unknown';

        gameOverEl.innerHTML = `
            <div class="game-over-content">
                <h2>🎮 Game Over!</h2>
                <p>${emoji} <strong>${name.charAt(0).toUpperCase() + name.slice(1)}</strong> went extinct!</p>
                <p>You survived <strong>${finalTick.toLocaleString()}</strong> ticks</p>
            </div>
        `;
        gameOverEl.classList.remove('hidden');

        // Update pause button to show game is over
        this.pauseBtn.textContent = '💀 Ended';
        this.pauseBtn.disabled = true;
    }

    /**
     * Hides the game over message.
     */
    hideGameOver(): void {
        const gameOverEl = document.getElementById('game-over-message');
        if (gameOverEl) {
            gameOverEl.classList.add('hidden');
        }
        this.pauseBtn.disabled = false;
    }
}

// ============================================================================
// Screen Management
// ============================================================================

/**
 * Manages screen visibility transitions.
 */
export function showScreen(screenId: 'start-screen' | 'simulation-screen'): void {
    const startScreen = getElement<HTMLDivElement>('start-screen');
    const simScreen = getElement<HTMLDivElement>('simulation-screen');

    if (screenId === 'start-screen') {
        startScreen.classList.remove('hidden');
        simScreen.classList.add('hidden');
    } else {
        startScreen.classList.add('hidden');
        simScreen.classList.remove('hidden');
    }
}
