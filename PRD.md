# Life - Ecosystem Simulation Game

## Overview

**Life** is a single-page web application that simulates a simple ecosystem with three entities: **grass**, **sheep**, and **wolves**. The simulation runs on a 255×255 pixel grid where each entity occupies one pixel. Users can configure simulation parameters, observe population dynamics in real-time, and track changes via a live population chart.

## Goals

- Create an engaging, educational ecosystem simulation
- Provide intuitive controls for simulation parameters
- Display real-time population dynamics via charts
- Deliver a modern, responsive UI that works on desktop and mobile

## Core Features

### 1. Simulation Grid (255×255)
- Canvas-based rendering for performance
- Each pixel represents one entity (grass, sheep, wolf, or empty)
- Color-coded entities with a harmonious palette

### 2. Entities & Rules

| Entity | Color | Behavior |
|--------|-------|----------|
| **Grass** | Green shades | Grows randomly on empty cells, dies after life expectancy |
| **Sheep** | White/cream | Moves randomly, eats grass to survive and breed, dies without food |
| **Wolves** | Dark gray/black | Moves with hunting behavior, eats sheep within hunting radius, dies without food |

#### Life Cycle Rules
- **Grass**: Spawns on empty cells, dies after configurable lifespan
- **Sheep**: Eats grass to survive; after eating X grass, breeds (creates 1 new sheep nearby)
- **Wolves**: Hunts sheep within configurable radius; after eating Y sheep, breeds

### 3. Configurable Parameters (Start Screen)

| Parameter | Default | Description |
|-----------|---------|-------------|
| Grass life expectancy | 50 ticks | How long grass lives |
| Sheep life expectancy | 100 ticks | Max lifespan |
| Wolf life expectancy | 150 ticks | Max lifespan |
| Wolf hunting radius | 5 pixels | Detection range for prey |
| Sheep starvation time | 20 ticks | Ticks without food → death |
| Wolf starvation time | 30 ticks | Ticks without food → death |
| Sheep breed threshold | 3 grass | Grass eaten to breed |
| Wolf breed threshold | 2 sheep | Sheep eaten to breed |
| Initial grass count | 5000 | Starting population |
| Initial sheep count | 500 | Starting population |
| Initial wolf count | 50 | Starting population |
| Game speed | 10 ticks/sec | Simulation speed |

### 4. Presets
- **Balanced**: Default values for stable ecosystem
- **Predator Paradise**: More wolves, larger hunting radius
- **Peaceful Meadow**: No wolves, lots of grass
- **Survival Mode**: Scarce resources, fast deaths

### 5. Population Chart
- Real-time line chart showing population over time
- Three lines: Grass (green), Sheep (white), Wolves (red/gray)
- Updates every N ticks for performance

### 6. Controls
- **Start/Pause** button
- **Reset** button (returns to start screen)
- **Speed slider** (adjustable during simulation)

## UI/UX Requirements

### Design
- Modern, dark theme with vibrant accent colors
- Glassmorphism effects for control panels
- Smooth animations and transitions
- Responsive: works on desktop (grid + chart side by side) and mobile (stacked layout)

### Layout
- **Desktop**: Grid on left, controls + chart on right
- **Mobile**: Grid on top, controls + chart below (scrollable)

## Technical Stack

- **Framework**: Vite + TypeScript
- **Rendering**: HTML5 Canvas for grid
- **Charting**: Lightweight library (Chart.js or custom canvas)
- **Styling**: Vanilla CSS with CSS variables
- **Testing**: Vitest for unit tests

## Non-Goals (MVP)

- No save/load functionality
- No multiplayer
- No sound effects
- No advanced AI behaviors

## Success Metrics

- Simulation runs smoothly at 60fps on modern devices
- All parameters are adjustable and take effect
- Population chart updates in real-time
- Mobile layout is usable and responsive
