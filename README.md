# Circuit Board Animation

A React application featuring a cool animated circuit board pattern that's responsive for mobile screens.

## Features

- Dynamic circuit board animation with animated path drawing
- Responsive design that adapts to different screen sizes
- Mobile-optimized touch interactions
- TypeScript support
- Automatic regeneration on window resize

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your machine.

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How It Works

The animation creates a grid-based circuit board effect by:

1. Dividing the screen into a grid of cells
2. Generating random wire paths that connect multiple cells
3. Drawing SVG paths with animated stroke effects
4. Adding connection points (circles) at the start and end of each wire
5. Automatically regenerating the pattern when the window is resized

## Customization

You can modify the animation settings in `src/components/CircuitBoardAnimation.tsx`:

- `size`: Grid cell size (default: 10)
- `leave`: Spacing between wires (default: 10)
- `wireMaxLen`: Maximum length of each wire (default: 40)
- `stroke`: Wire color (default: '#ff9f43')
- `fill`: Background color (default: '#10ac84')

## Mobile Responsiveness

The application includes several mobile optimizations:

- Dynamic viewport height support (`100dvh`)
- Touch action handling for smooth interactions
- Responsive breakpoints for different screen sizes
- Automatic regeneration on orientation change 