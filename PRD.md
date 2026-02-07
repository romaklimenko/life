# Product Requirements Document (PRD) - Life Simulation

## 1. Introduction
"Life" is a single-page application (SPA) simulation game that models an ecosystem containing grass, sheep, and wolves on a 255x255 grid. The simulation observes the interactions between these entities based on configurable parameters, including life expectancy, hunting mechanics, and reproduction rules.

## 2. Core Features

### 2.1 The Board
-   **Grid Size**: 255x255 cells.
-   **Entities**:
    -   **Grass**: The base food source. Green color.
    -   **Sheep**: Primary consumers. White/Light color. Eat grass.
    -   **Wolves**: Secondary consumers. Red/Dark color. Eat sheep.
-   **Initialization**: Random seeding of all three entities upon start/reset.

### 2.2 Simulation Mechanics
All entities occupy a single pixel (cell). The simulation runs in discrete time steps (ticks).

#### Entities & Lifecycle
1.  **Grass**:
    -   Grows randomly or spreads (if applicable, though simple random seeding or regrowth rules can work). To clarify: "randomly seed grass" implies it exists at start. Typically in such games, grass regrows or spreads. *Assumption*: Grass regrows at a certain rate or has a probability to spawn in empty cells, or simply exists purely based on initial seed and reproduction if defined.
        -   *Refinement*: Let's allow grass to spread or regrow to make the simulation sustainable.
    -   Has a life expectancy (optional, usually grass just gets eaten, but we can add age).
    -   "How many grass to eat to breed for a sheep" implies sheep eat grass.

2.  **Sheep**:
    -   Move randomly.
    -   **Energy/Hunger**: Must eat grass to survive.
    -   **Die**: If they run out of energy (time to die without food) or reach maximum age (life expectancy).
    -   **Reproduce**: Asexual. Requires eating a specific number of grass units.

3.  **Wolves**:
    -   Move towards sheep if within "hunting radius". Otherwise move randomly.
    -   **Energy/Hunger**: Must eat sheep to survive.
    -   **Die**: If they run out of energy or reach maximum age.
    -   **Reproduce**: Asexual. Requires eating a specific number of sheep.

### 2.3 Configuration Parameters (Inputs)
Users can adjust these before or during the simulation:
-   **General**:
    -   Game Speed (ticks per second).
-   **Grass**:
    -   Life Expectancy (optional, maybe effectively infinite unless eaten, but user asked for it).
    -   Regrowth Rate (needed to sustain population)? *Decision*: Add a parameter for grass regrowth chance if not explicitly requested, as strictly finite grass leads to extinction. Or "Randomly seed" means we just re-seed occasionally? Let's assume standard "Game of Life" style or simple cellular automata rules for grass, or just spontaneous generation probability.
-   **Sheep**:
    -   Life Expectancy.
    -   Time to die without food (Energy decay).
    -   Food to breed (Grass eaten).
-   **Wolves**:
    -   Life Expectancy.
    -   Time to die without food.
    -   Hunting Radius (vision range).
    -   Food to breed (Sheep eaten).

### 2.4 Data Visualization
-   **Real-time Chart**: A line chart showing the population size of Grass, Sheep, and Wolves over time.

### 2.5 Controls & UI
-   **Play/Pause**: Start and stop the simulation.
-   **Reset**: Clear board and re-seed based on parameters.
-   **Presets**: Pre-defined configurations (e.g., "Balanced", "Wolf Dominance", "Sheep Explosion").
-   **Responsive Design**: Mobile-friendly layout.
-   **Modern Aesthetics**: Nice color schema, decent typography, potential dark mode or high-contrast modern look.

## 3. Technical Stack
-   **Framework**: React (Vite).
-   **Language**: TypeScript.
-   **Styling**: Vanilla CSS (CSS Modules or standard CSS) with a focus on modern design (Variables, Flexbox/Grid). Responsive.
-   **State Management**: React Context or local state (sufficient for this scale).
-   **Canvas**: HTML5 Canvas for the 255x255 grid rendering (performance is key for 65k cells).
-   **Charting**: A lightweight charting library (e.g., Recharts, Chart.js, or simple SVG implementation). Let's use `recharts` or `chart.js`.

## 4. Implementation phases
-   **Phase 1**: Project Setup & Basic UI Shell.
-   **Phase 2**: Core Engine (Grid, Loop, Entities).
-   **Phase 3**: Simulation Logic (Movement, Eating, Breeding).
-   **Phase 4**: Controls & Parameters.
-   **Phase 5**: Charting & Analytics.
-   **Phase 6**: Polish, Presets, Mobile responsiveness.

## 5. Constraints & detailed requirements
-   "Animals and grass are asexual, no mating to breed." -> Simply spawn new entity when energy/food threshold matched.
-   "255*255 dots" -> Canvas is best for performance.
-   "Modern and responsive UI" -> Sidebar/Drawer for settings on mobile, or bottom sheet.
