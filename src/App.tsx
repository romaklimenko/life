import React, { useState, useCallback, useRef, useEffect } from 'react';
import { World } from './engine/world';
import { GameCanvas } from './components/GameCanvas';
import { ControlPanel } from './components/ControlPanel';
import { PopulationChart } from './components/PopulationChart';
import { useInterval } from './hooks/useInterval';
import { DEFAULT_CONFIG } from './types';
import { applyPreset } from './presets';
import type { Checkpoint, SimulationConfig } from './types';
import './index.css';
import './App.css';

const App: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ tick: 0, grass: 0, sheep: 0, wolf: 0 });
  const [history, setHistory] = useState<Checkpoint[]>([]);

  // Mutable world ref to avoid re-instantiation on every render
  const worldRef = useRef<World>(new World(config));

  // Re-initialize world when config changes
  useEffect(() => {
    worldRef.current.config = config;
  }, [config]);

  const handleReset = useCallback(() => {
    setRunning(false);
    worldRef.current.reset();
    setStats(worldRef.current.stats); // Sync
    setHistory([]);
  }, []);

  const handlePreset = (name: string) => {
    const newConfig = applyPreset(name);
    setConfig(newConfig);
    setRunning(false);
    worldRef.current = new World(newConfig); // Recreate world to ensure fresh state
    setStats(worldRef.current.stats);
    setHistory([]);
  };

  useInterval(() => {
    // Update logic
    const world = worldRef.current;
    world.update();

    // Update React state sparsely to avoid lag
    if (world.stats.tick % 5 === 0) {
      setStats({ ...world.stats });

      // Update history every 20 ticks
      if (world.stats.tick % 20 === 0) {
        setHistory(prev => {
          const newPoint: Checkpoint = {
            tick: world.stats.tick,
            grassCount: world.stats.grass,
            sheepCount: world.stats.sheep,
            wolfCount: world.stats.wolf
          };
          // Limit history length
          if (prev.length > 200) return [...prev.slice(1), newPoint];
          return [...prev, newPoint];
        });
      }
    }
  }, running ? (1000 / config.gameSpeed) : null);

  return (
    <div className="app-container">
      <header>
        <h1>Life Simulation</h1>
        <p>An ecosystem simulation of Grass, Sheep, and Wolves.</p>
      </header>

      <div className="top-section">
        <GameCanvas
          world={worldRef.current}
          running={running}
          generation={stats.tick}
        />

        <ControlPanel
          config={config}
          setConfig={setConfig}
          running={running}
          onStartParams={() => setRunning(!running)}
          onReset={handleReset}
          onPreset={handlePreset}
          stats={stats}
        />
      </div>

      <PopulationChart data={history} />
    </div>
  );
};

export default App;
