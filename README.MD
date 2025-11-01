# Motorcycle Trip Planner

A focused trip planning tool for motorcyclists that provides per-leg route metrics and supports unlimited waypoints.

## Features

- 🗺️ Interactive map with click-to-add waypoints
- 🔍 Location search with autocomplete
- 🛣️ Avoid highways option for scenic routes
- 📊 Per-leg distance and time breakdown
- 🏍️ Optimized for motorcycle day trip planning

## Prerequisites

- Node.js 16+ and npm
- Google Maps API Key with the following APIs enabled:
  - Maps JavaScript API
  - Directions API
  - Places API

## Getting Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Directions API
   - Places API
4. Go to "Credentials" and create an API key
5. (Recommended) Restrict your API key:
   - Application restrictions: HTTP referrers (for production)
   - API restrictions: Select only the three APIs listed above

## Installation

1. Clone or download this project

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Important:** Never commit your `.env.local` file to version control. It's already included in `.gitignore`.

## Running the Application

Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Project Structure

```
motorcycle-trip-planner/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── MapContainer.jsx       # Google Maps display
│   │   ├── WaypointPanel.jsx      # Sidebar with waypoints & metrics
│   │   ├── SearchBox.jsx          # Places autocomplete search
│   │   ├── WaypointList.jsx       # List of waypoints
│   │   ├── RouteMetrics.jsx       # Per-leg breakdown & totals
│   │   └── EmptyState.jsx         # Helper UI for empty state
│   ├── utils/
│   │   ├── mapConfig.js           # Map settings & constants
│   │   └── routeCalculator.js     # Directions API logic
│   ├── App.jsx                    # Main app component
│   ├── App.css                    # Global styles
│   └── index.js                   # Entry point
├── .env.local                     # API key (DO NOT COMMIT)
├── .gitignore
├── package.json
└── README.md
```

## Architecture Overview

### State Management
- **App.jsx**: Root component managing global state with React hooks
  - `waypoints`: Array of waypoint objects with position, address, and order
  - `route`: Current route data from Directions API including legs
  - `mapSettings`: Highway avoidance, center, zoom
  - `ui`: Loading states, errors

### Component Hierarchy
```
App
├── MapContainer (Map display & click interactions)
└── WaypointPanel (Sidebar)
    ├── SearchBox (Places Autocomplete)
    ├── WaypointList (Waypoint management)
    └── RouteMetrics (Per-leg breakdown)
```

### API Integration
- **Google Maps JavaScript API**: Map display via `@react-google-maps/api`
- **Directions API**: Route calculation with per-leg data
- **Places API**: Location search and geocoding

### Key Features Implementation

**Per-Leg Metrics:**
The Directions API returns a `legs` array where each leg represents one segment between consecutive waypoints. Each leg contains:
- `distance.text` and `distance.value`
- `duration.text` and `duration.value`
- `start_address` and `end_address`

We parse this directly from the API response to display individual segment metrics.

**Highway Avoidance:**
Passed to Directions API via `avoidHighways: true` option, which routes through scenic roads preferred by motorcyclists.

**API Call Optimization:**
- Debounced route recalculation (500ms delay)
- Only recalculates when waypoints or settings change
- Caching of last successful route

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_GOOGLE_MAPS_API_KEY` | Your Google Maps API key | Yes |

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Known Limitations

- Client-side only (no trip saving/loading)
- No user authentication
- Routes calculated in real-time (requires internet connection)

## Future Enhancements (Phase 2+)

- User accounts and trip saving
- Trip sharing via URL
- Drag-to-reorder waypoints
- Export to GPX format
- Weather integration
- Photo attachments at waypoints

## Troubleshooting

**Map not loading:**
- Check that your API key is correct in `.env.local`
- Verify Maps JavaScript API is enabled
- Check browser console for errors

**Route not calculating:**
- Verify Directions API is enabled
- Check that you have at least 2 waypoints
- Ensure waypoints are in accessible locations

**Search not working:**
- Verify Places API is enabled
- Check API key restrictions

## License

Private project - All rights reserved