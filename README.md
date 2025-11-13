# IREN Community | Financials

A React-based financial analysis tool for IREN stock valuation. This application allows users to model and analyze various revenue streams including Colocation, Hyperscaler IaaS, and IREN Cloud operations.

## Features

- **Share Price Calculation**: Calculate share price based on Market Cap and Fully Diluted Shares
- **Multiple Site Types**:
  - Colocation sites with customizable load, PUE, and revenue parameters
  - Hyperscaler IaaS sites with contract modeling and GPU depreciation
  - IREN Cloud sites with GPU deployment and datacenter cost analysis
- **GPU Pricing**: Configurable pricing for various GPU types (GB300, B200, B300, MI350X)
- **Contract Gap Analysis**: Model improvements in contract negotiations relative to Nebius benchmarks
- **Pre-configured Sites**: Includes default configurations for Prince George, Mackenzie + Canal Flats, Horizon 1-10, and Sweetwater sites

## Local Development

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## GitHub Pages Deployment

This project is configured for GitHub Pages deployment.

### Deploy to GitHub Pages

```bash
npm run deploy
```

This will:
1. Build the production version of the app
2. Deploy it to the `gh-pages` branch
3. Make it available at `https://[your-username].github.io/iren-community/`

### First-time Setup

1. Make sure you have a GitHub repository created
2. Push your code to the repository
3. Run `npm run deploy`
4. Go to your repository settings → Pages
5. Ensure the source is set to the `gh-pages` branch

## Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **CSS3**: Custom styling with modern CSS features

## Project Structure

```
iren-community/
├── src/
│   ├── components/
│   │   ├── GPUPrices.jsx       # GPU pricing configuration
│   │   ├── ColocationSite.jsx  # Colocation site component
│   │   ├── HyperscalerSite.jsx # Hyperscaler IaaS component
│   │   └── IRENCloudSite.jsx   # IREN Cloud component
│   ├── App.jsx                  # Main application logic
│   ├── App.css                  # Application styles
│   ├── index.css                # Global styles
│   └── main.jsx                 # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## License

This project is private and proprietary.
