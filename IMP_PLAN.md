# Implementation Plan - Life Simulation

## Phase 1: Project Setup & Cleanup
- [x] Initialize Vite + React + TS project (In Progress).
- [x] Install additional dependencies: `recharts`, `lucide-react`.
- [x] Clean up `App.tsx` and removed unused assets.
- [x] Set up directory structure: `src/components`, `src/engine`, `src/types`, `src/hooks`.

## Phase 2: Core Engine & Data Structures
- [x] Define types in `src/types/index.ts`.
- [x] Implement `World` class in `src/engine/world.ts`: Manage the 255x255 array.
- [x] Create `useInterval` hook to manage the loop.

## Phase 3: Rendering Engine
- [x] Create `GameCanvas` component.
- [x] Implement drawing logic using `requestAnimationFrame`. 
- [x] Ensure canvas scales correctly.

## Phase 4: Simulation Logic
- [x] Implement `update()` function in `World` class.
- [x] **Grass Logic**: Regrowth/Spawn.
- [x] **Sheep Logic**: Move, Eat Grass, Reproduce, Die.
- [x] **Wolf Logic**: Move (hunt), Eat Sheep, Reproduce, Die.
- [x] Integrate configurable parameters.

## Phase 5: UI & Controls
- [x] Create `ControlPanel` component.
- [x] Add sliders/inputs for parameters.
- [x] Add Start/Pause/Reset buttons.
- [x] Add Presets (moved to `src/presets.ts`).

## Phase 6: Analytics & Charting
- [x] Create `PopulationChart` component.
- [x] track history of population counts.
- [x] displaying live updates.

## Phase 7: Polish & Mobile
- [x] Style with CSS Modules / Variables for "Rich Aesthetics".
- [x] Dark mode support (default).
- [x] Ensure controls are accessible on mobile.

## Phase 8: Testing
- [x] Unit tests for `World` logic (`src/engine/world.test.ts`).
- [x] Verified build (`npm run build`).

## Done
Project is fully implemented and ready to run.
