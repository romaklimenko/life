import React from 'react';
import type { SimulationConfig } from '../types';

interface ControlPanelProps {
    config: SimulationConfig;
    setConfig: (config: SimulationConfig) => void;
    running: boolean;
    onStartParams: () => void;
    onReset: () => void;
    onPreset: (name: string) => void;
    stats: { grass: number; sheep: number; wolf: number; tick: number };
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    config, setConfig, running, onStartParams, onReset, onPreset, stats
}) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? Number(value) : value;
        setConfig({
            ...config,
            [name]: val
        });
    };

    return (
        <div className="control-panel">
            <div className="stats-header">
                <h3>Statistics</h3>
                <div className="stat-grid">
                    <div>Tick: {stats.tick}</div>
                    <div style={{ color: '#4ade80' }}>Grass: {stats.grass}</div>
                    <div style={{ color: '#ffffff' }}>Sheep: {stats.sheep}</div>
                    <div style={{ color: '#ef4444' }}>Wolves: {stats.wolf}</div>
                </div>
            </div>

            <div className="actions">
                <button onClick={onStartParams}>{running ? 'Pause' : 'Start'}</button>
                <button onClick={onReset} className="secondary">Reset</button>
            </div>

            <div className="params-section">
                <h4>General</h4>
                <label>
                    Speed (Ticks/sec)
                    <input type="range" min="1" max="60" name="gameSpeed" value={config.gameSpeed} onChange={handleChange} />
                    <span>{config.gameSpeed}</span>
                </label>
            </div>

            <details>
                <summary>Grass Settings</summary>
                <label>
                    Regrowth Rate (%)
                    <input type="number" name="grassRegrowthRate" value={config.grassRegrowthRate} onChange={handleChange} step="0.1" />
                </label>
            </details>

            <details>
                <summary>Sheep Settings</summary>
                <label>Start Count <input type="number" name="sheepInitialCount" value={config.sheepInitialCount} onChange={handleChange} /></label>
                <label>Life Exp. <input type="number" name="sheepLifeExpectancy" value={config.sheepLifeExpectancy} onChange={handleChange} /></label>
                <label>Energy Decay <input type="number" name="sheepEnergyDecay" value={config.sheepEnergyDecay} onChange={handleChange} /></label>
                <label>Repro. Threshold <input type="number" name="sheepReproductionThreshold" value={config.sheepReproductionThreshold} onChange={handleChange} /></label>
            </details>

            <details>
                <summary>Wolf Settings</summary>
                <label>Start Count <input type="number" name="wolfInitialCount" value={config.wolfInitialCount} onChange={handleChange} /></label>
                <label>Life Exp. <input type="number" name="wolfLifeExpectancy" value={config.wolfLifeExpectancy} onChange={handleChange} /></label>
                <label>Energy Decay <input type="number" name="wolfEnergyDecay" value={config.wolfEnergyDecay} onChange={handleChange} /></label>
                <label>Repro. Threshold <input type="number" name="wolfReproductionThreshold" value={config.wolfReproductionThreshold} onChange={handleChange} /></label>
                <label>Hunting Radius <input type="number" name="wolfHuntingRadius" value={config.wolfHuntingRadius} onChange={handleChange} /></label>
            </details>

            <div className="presets">
                <h4>Presets</h4>
                <button onClick={() => onPreset('balanced')} className="small">Balanced</button>
                <button onClick={() => onPreset('explosive')} className="small">Explosive</button>
                <button onClick={() => onPreset('apocalypse')} className="small">Apocalypse</button>
            </div>
        </div>
    );
};
