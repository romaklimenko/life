# Life Simulation

A modern, responsive single-page application simulating a simple ecosystem with Grass, Sheep, and Wolves.

## Overview
This application simulates a 255x255 "world" where entities interact based on simple rules:
- **Grass**: Grows randomly.
- **Sheep**: Eat grass to survive and reproduce.
- **Wolves**: Hunt sheep to survive and reproduce.

The simulation runs in real-time, allowing you to tweak parameters and observe the population dynamics.

## Features
- **Real-time Rendering**: High-performance canvas rendering of 65,000+ cells.
- **Interactive Controls**: Adjust life expectancy, reproduction thresholds, hunting radius, and spawn rates on the fly.
- **Live Analytics**: Watch population trends on a dynamic chart.
- **Presets**: Jump into different scenarios like "Balanced", "Explosive Growth", or "Wolf Apocalypse".
- **Responsive Design**: Works on desktop and mobile.

## Tech Stack
- **React** (Vite)
- **TypeScript**
- **HTML5 Canvas** (for performance)
- **Recharts** (for data visualization)
- **CSS Modules / Vanilla CSS**

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run Development Server**
    ```bash
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

## Simulation Rules
- **Movement**: Animals move randomly unless hunting (Wolves move towards Sheep).
- **Eating**: Sheep eat Grass. Wolves eat Sheep. Eating restores energy.
- **Reproduction**: Animals reproduce asexually when they accumulate enough energy.
- **Death**: Entities die when they run out of energy (starvation) or reach their life expectancy (old age).

## License
MIT
