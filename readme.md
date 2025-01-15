# Hospital Survival Game

A 2D top-down survival game built with Phaser 3 and TypeScript where players navigate through a hospital environment while fighting enemies.

## 🎮 Game Overview

Players control a character in a hospital setting, shooting at enemies while managing their health. The game features:

- Top-down shooter mechanics
- Health management system
- Enemy AI with pathfinding
- Score tracking system
- High score persistence

## 🏗 Project Structure
src/
├── assets/
│ └── hospital.json # Tilemap data for hospital level
├── entities/
│ ├── bullet.ts # Bullet projectile logic
│ ├── enemy.ts # Enemy AI and behavior
│ ├── entity.ts # Base class for game entities
│ └── player.ts # Player character logic
├── scenes/
│ ├── hospital.ts # Main game scene
│ ├── end-screen.ts # Game over screen
│ ├── start-screen.ts # Title/menu screen
│ └── index.ts # Scene registry
└── utils/
└── constants.ts # Game constants and sprite definitions


## 🎯 Core Features

### Player (player.ts)
- Movement controls
- Shooting mechanics with cooldown
- Health management
- Visual health bar
- Animation states

### Enemy (enemy.ts)
- AI pathfinding
- Player tracking
- Attack mechanics
- Collision detection with walls
- Death handling

### Combat System
- Projectile-based combat (bullet.ts)
- Damage system
- Cooldown management
- Hit detection

### Game Flow
- Start Screen → Hospital Level → End Screen
- Score tracking
- High score system using localStorage
- Restart and menu navigation options

## 🔧 Technical Implementation

### Entity System
All game objects inherit from a base `Entity` class that provides:
- Health management
- Basic physics setup
- Damage handling

### Scene Management
- `Hospital`: Main gameplay scene
- `EndScreen`: Game over handling and score display
- `StartScreen`: Game entry point and menu
- Scene transitions and state management

### Map System
- Tilemap-based level design
- Wall collision system
- Enemy spawn points
- Player boundaries

## 🎨 Assets
The game uses a tileset for the environment with:
- 16x16 pixel tiles
- 400 unique tiles
- Multiple layers for ground and walls

## 🎮 Controls
- Movement: (Not specified in provided code)
- Shooting: Left mouse button
- Aiming: Mouse position

## 🏆 Scoring
- Tracks kills during gameplay
- Maintains high score in localStorage
- Displays current and high scores on game over

## 🛠 Development
Built with:
- Phaser 3 game framework
- TypeScript for type safety
- JSON-based tilemaps
- Object-oriented programming principles

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A modern web browser

### Installation

1. Clone the repository:
bash
git clone https://git.fhict.nl/I533293/project-x
cd project-x

2. Install dependencies:
bash
npm install

3. Start the development server:
bash
npm run dev
