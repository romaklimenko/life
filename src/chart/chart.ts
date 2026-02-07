/**
 * Life Ecosystem Simulation - Population Chart
 * 
 * Real-time line chart for displaying population history.
 * Uses Canvas for rendering without external dependencies.
 */

import { PopulationDataPoint } from '../types';
import { CSS_COLORS } from '../rendering/colors';

/**
 * Configuration for the chart.
 */
interface ChartConfig {
    /** Canvas element to draw on */
    canvas: HTMLCanvasElement;
    /** Chart title */
    title?: string;
    /** Padding around the chart */
    padding?: number;
}

/**
 * PopulationChart renders a real-time line chart of population history.
 * 
 * Features:
 * - Three lines for grass, sheep, and wolves
 * - Auto-scaling Y axis based on data
 * - Smooth line rendering
 * - Legend display
 */
export class PopulationChart {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private padding: number;

    /**
     * Creates a new PopulationChart.
     * @param config - Chart configuration
     */
    constructor(config: ChartConfig) {
        this.canvas = config.canvas;
        this.padding = config.padding ?? 10;

        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D canvas context');
        }
        this.ctx = ctx;
    }

    /**
     * Renders the chart with the given data.
     * @param history - Population history data points
     */
    render(history: PopulationDataPoint[]): void {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        // Clear canvas
        ctx.fillStyle = 'rgb(18, 18, 26)';
        ctx.fillRect(0, 0, width, height);

        if (history.length < 2) {
            this.drawNoDataMessage();
            return;
        }

        // Calculate chart area
        const chartLeft = this.padding + 35; // Space for Y axis labels
        const chartRight = width - this.padding;
        const chartTop = this.padding;
        const chartBottom = height - this.padding - 20; // Space for X axis
        const chartWidth = chartRight - chartLeft;
        const chartHeight = chartBottom - chartTop;

        // Find max values for scaling
        const maxGrass = Math.max(...history.map(d => d.grass), 1);
        const maxSheep = Math.max(...history.map(d => d.sheep), 1);
        const maxWolves = Math.max(...history.map(d => d.wolves), 1);
        const maxValue = Math.max(maxGrass, maxSheep * 10, maxWolves * 50);

        // Draw grid lines
        this.drawGrid(chartLeft, chartTop, chartWidth, chartHeight, maxValue);

        // Draw lines
        this.drawLine(history, 'grass', chartLeft, chartTop, chartWidth, chartHeight, maxValue, CSS_COLORS.grassLine);
        this.drawLine(history, 'sheep', chartLeft, chartTop, chartWidth, chartHeight, maxValue, CSS_COLORS.sheepLine);
        this.drawLine(history, 'wolves', chartLeft, chartTop, chartWidth, chartHeight, maxValue, CSS_COLORS.wolfLine);

        // Draw legend
        this.drawLegend(width);
    }

    /**
     * Draws a message when there's insufficient data.
     */
    private drawNoDataMessage(): void {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(160, 160, 176, 0.5)';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for data...', this.canvas.width / 2, this.canvas.height / 2);
    }

    /**
     * Draws the background grid.
     */
    private drawGrid(
        left: number,
        top: number,
        width: number,
        height: number,
        maxValue: number
    ): void {
        const ctx = this.ctx;
        const gridLines = 4;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'rgba(160, 160, 176, 0.5)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';

        for (let i = 0; i <= gridLines; i++) {
            const y = top + (height * i) / gridLines;
            const value = Math.round(maxValue * (1 - i / gridLines));

            // Draw line
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(left + width, y);
            ctx.stroke();

            // Draw label
            ctx.fillText(this.formatNumber(value), left - 5, y + 3);
        }
    }

    /**
     * Formats a number for display (with K suffix for thousands).
     */
    private formatNumber(n: number): string {
        if (n >= 1000) {
            return (n / 1000).toFixed(1) + 'K';
        }
        return n.toString();
    }

    /**
     * Draws a line for one population type.
     */
    private drawLine(
        history: PopulationDataPoint[],
        key: 'grass' | 'sheep' | 'wolves',
        left: number,
        top: number,
        width: number,
        height: number,
        maxValue: number,
        color: string
    ): void {
        const ctx = this.ctx;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.beginPath();

        for (let i = 0; i < history.length; i++) {
            const x = left + (i / (history.length - 1)) * width;
            const value = history[i][key];
            const y = top + height - (value / maxValue) * height;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();
    }

    /**
     * Draws the legend.
     */
    private drawLegend(canvasWidth: number): void {
        const ctx = this.ctx;
        const legendY = this.canvas.height - 10;
        const items = [
            { label: 'Grass', color: CSS_COLORS.grassLine },
            { label: 'Sheep', color: CSS_COLORS.sheepLine },
            { label: 'Wolves', color: CSS_COLORS.wolfLine },
        ];

        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'left';

        let x = this.padding + 35;
        const spacing = 70;

        for (const item of items) {
            // Color box
            ctx.fillStyle = item.color;
            ctx.fillRect(x, legendY - 6, 12, 3);

            // Label
            ctx.fillStyle = 'rgba(160, 160, 176, 0.8)';
            ctx.fillText(item.label, x + 16, legendY);

            x += spacing;
        }
    }

    /**
     * Clears the chart.
     */
    clear(): void {
        this.ctx.fillStyle = 'rgb(18, 18, 26)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawNoDataMessage();
    }
}
