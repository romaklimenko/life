/**
 * Configuration Validation Tests
 */

import { describe, it, expect } from 'vitest';
import {
    validateConfig,
    validateGrassConfig,
    validateSheepConfig,
    validateWolfConfig,
    sanitizeConfig,
    clamp,
    CONFIG_RANGES,
} from '../validation';
import { DEFAULT_CONFIG } from '../defaults';

describe('clamp', () => {
    it('should return value if within range', () => {
        expect(clamp(5, 1, 10)).toBe(5);
    });

    it('should return min if value below range', () => {
        expect(clamp(-5, 1, 10)).toBe(1);
    });

    it('should return max if value above range', () => {
        expect(clamp(15, 1, 10)).toBe(10);
    });
});

describe('validateGrassConfig', () => {
    it('should accept valid config', () => {
        const errors = validateGrassConfig(DEFAULT_CONFIG.grass);
        expect(errors).toHaveLength(0);
    });

    it('should reject invalid life expectancy', () => {
        const errors = validateGrassConfig({
            ...DEFAULT_CONFIG.grass,
            lifeExpectancy: 0,
        });
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('life expectancy');
    });

    it('should reject invalid spread rate', () => {
        const errors = validateGrassConfig({
            ...DEFAULT_CONFIG.grass,
            spreadRate: 200,
        });
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('spread rate');
    });
});

describe('validateSheepConfig', () => {
    it('should accept valid config', () => {
        const errors = validateSheepConfig(DEFAULT_CONFIG.sheep);
        expect(errors).toHaveLength(0);
    });

    it('should reject invalid starvation time', () => {
        const errors = validateSheepConfig({
            ...DEFAULT_CONFIG.sheep,
            starvationTime: 0,
        });
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('starvation');
    });
});

describe('validateWolfConfig', () => {
    it('should accept valid config', () => {
        const errors = validateWolfConfig(DEFAULT_CONFIG.wolf);
        expect(errors).toHaveLength(0);
    });

    it('should reject invalid hunting radius', () => {
        const errors = validateWolfConfig({
            ...DEFAULT_CONFIG.wolf,
            huntingRadius: 100,
        });
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('hunting radius');
    });
});

describe('validateConfig', () => {
    it('should accept default config', () => {
        const result = validateConfig(DEFAULT_CONFIG);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should collect multiple errors', () => {
        const badConfig = {
            grass: { lifeExpectancy: 0, initialCount: -1, spreadRate: 200 },
            sheep: { lifeExpectancy: 0, initialCount: -1, starvationTime: 0, breedThreshold: 0 },
            wolf: { lifeExpectancy: 0, initialCount: -1, starvationTime: 0, breedThreshold: 0, huntingRadius: 0 },
            gameSpeed: 0,
        };

        const result = validateConfig(badConfig);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(5);
    });
});

describe('sanitizeConfig', () => {
    it('should not change valid config', () => {
        const sanitized = sanitizeConfig(DEFAULT_CONFIG);
        expect(sanitized).toEqual(DEFAULT_CONFIG);
    });

    it('should clamp values to valid ranges', () => {
        const badConfig = {
            grass: { lifeExpectancy: 0, initialCount: 100000, spreadRate: 200 },
            sheep: { lifeExpectancy: 1000, initialCount: -100, starvationTime: 0, breedThreshold: 100 },
            wolf: { lifeExpectancy: 0, initialCount: 5000, starvationTime: 200, breedThreshold: 50, huntingRadius: 100 },
            gameSpeed: 1000,
        };

        const sanitized = sanitizeConfig(badConfig);
        const r = CONFIG_RANGES;

        expect(sanitized.grass.lifeExpectancy).toBe(r.grass.lifeExpectancy.min);
        expect(sanitized.grass.initialCount).toBe(r.grass.initialCount.max);
        expect(sanitized.sheep.initialCount).toBe(r.sheep.initialCount.min);
        expect(sanitized.wolf.huntingRadius).toBe(r.wolf.huntingRadius.max);
        expect(sanitized.gameSpeed).toBe(r.gameSpeed.max);
    });
});
