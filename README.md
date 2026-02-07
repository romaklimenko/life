# 🌿 Life - Ecosystem Simulation

A single-page web application that simulates a simple ecosystem with grass, sheep, and wolves on a 255×255 pixel grid.

![Life Simulation](https://img.shields.io/badge/TypeScript-5.3-blue) ![Vite](https://img.shields.io/badge/Vite-5.0-purple) ![Tests](https://img.shields.io/badge/tests-76%20passing-green)

## Features

- **255×255 Grid Simulation** - Real-time ecosystem with grass, sheep, and wolves
- **Configurable Parameters** - Customize life expectancy, breeding rates, hunting radius, and more
- **4 Presets** - Balanced, Predator Paradise, Peaceful Meadow, Survival Mode
- **Population Chart** - Real-time visualization of population dynamics
- **Responsive UI** - Works on desktop and mobile devices
- **Modern Design** - Dark theme with glassmorphism effects

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd life

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Running Tests

```bash
npm run test        # Run tests in watch mode
npm run test -- --run  # Run tests once
```

## How It Works

### Entities

| Entity | Behavior |
|--------|----------|
| 🌱 **Grass** | Spreads to adjacent empty cells, dies after life expectancy |
| 🐑 **Sheep** | Moves randomly, eats grass to survive and breed, dies from starvation |
| 🐺 **Wolves** | Hunts sheep within radius, eats sheep to survive and breed, dies from starvation |

### Simulation Rules

1. **Grass** spreads based on spread rate percentage and dies after its life expectancy
2. **Sheep** must eat grass to survive; after eating enough, they breed asexually
3. **Wolves** hunt sheep within their hunting radius; after eating enough, they breed
4. All entities die when reaching their life expectancy or from starvation

## Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| Life Expectancy | Ticks until entity dies of old age | 50/100/150 |
| Initial Count | Starting population | 5000/500/50 |
| Starvation Time | Ticks without food before death | 20/30 |
| Breed Threshold | Food needed to reproduce | 3/2 |
| Hunting Radius | Wolf detection range (cells) | 5 |
| Spread Rate | % chance grass spreads per tick | 5 |

## Tech Stack

- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe development
- **Vitest** - Unit testing
- **HTML5 Canvas** - High-performance grid rendering

## Project Structure

```
src/
├── chart/          # Population chart component
├── config/         # Configuration and presets
├── rendering/      # Canvas renderer and colors
├── simulation/     # Core engine, grid, entities
├── ui/             # UI controllers
├── styles/         # CSS design system
├── types.ts        # TypeScript type definitions
└── main.ts         # Application entry point
```

## License

MIT
