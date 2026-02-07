/**
 * Population Chart Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PopulationChart } from '../chart';
import { PopulationDataPoint } from '../../types';

// Mock canvas context
function createMockCanvas(): HTMLCanvasElement {
    const canvas = {
        width: 300,
        height: 150,
        getContext: vi.fn(() => ({
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            lineJoin: '',
            lineCap: '',
            font: '',
            textAlign: '',
            fillRect: vi.fn(),
            fillText: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
        })),
    };
    return canvas as unknown as HTMLCanvasElement;
}

describe('PopulationChart', () => {
    let chart: PopulationChart;
    let mockCanvas: HTMLCanvasElement;

    beforeEach(() => {
        mockCanvas = createMockCanvas();
        chart = new PopulationChart({ canvas: mockCanvas });
    });

    it('should create chart instance', () => {
        expect(chart).toBeDefined();
    });

    it('should render with empty history', () => {
        expect(() => chart.render([])).not.toThrow();
    });

    it('should render with single data point', () => {
        const history: PopulationDataPoint[] = [
            { tick: 0, grass: 100, sheep: 50, wolves: 10 },
        ];
        expect(() => chart.render(history)).not.toThrow();
    });

    it('should render with multiple data points', () => {
        const history: PopulationDataPoint[] = [
            { tick: 0, grass: 100, sheep: 50, wolves: 10 },
            { tick: 1, grass: 110, sheep: 48, wolves: 11 },
            { tick: 2, grass: 120, sheep: 46, wolves: 12 },
        ];
        expect(() => chart.render(history)).not.toThrow();
    });

    it('should handle zero populations', () => {
        const history: PopulationDataPoint[] = [
            { tick: 0, grass: 0, sheep: 0, wolves: 0 },
            { tick: 1, grass: 0, sheep: 0, wolves: 0 },
        ];
        expect(() => chart.render(history)).not.toThrow();
    });

    it('should clear chart', () => {
        expect(() => chart.clear()).not.toThrow();
    });
});
