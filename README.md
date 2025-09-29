# Shopify Developer Assignment - Product Page Theme

A modern, production-ready Shopify theme implementing dynamic variant selection, subscription pricing, and advanced cart functionality. This project demonstrates best practices for Shopify theme development with automated testing, CI/CD pipeline, and comprehensive developer tooling.

## 🚀 Features

- **Dynamic Variant Selection**: Radio-based purchase mode selection (Single/Double subscription)
- **Flavor Swatches**: Visual flavor selection with image swatches (Chocolate, Vanilla, Orange)
- **Advanced Pricing Logic**: 
  - Subscription pricing with 25% discount
  - Site-wide 20% discount application
  - Real-time price calculations
- **Responsive Media Gallery**: Product images with thumbnail navigation
- **Dynamic Content**: Metafield-driven "What's Included" sections
- **Cart Integration**: Shopify Ajax Cart API integration
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation
- **Performance Optimized**: Efficient JavaScript modules and optimized assets

## 📋 Requirements Met

### ✅ Acceptance Criteria

- [x] Default selection on load = Single + Chocolate
- [x] Flavor selectors update correctly when switching modes
- [x] Price updates in real-time using correct formulas
- [x] "What's Included" content updates from metafields
- [x] Add-to-cart adds correct variant(s) with proper cart integration
- [x] Unit tests covering pricing & variant mapping
- [x] Playwright E2E tests covering core UI and cart flow
- [x] CI pipeline runs lint + tests and deploys on main
- [x] Production-ready code with error handling and accessibility

### 🧮 Pricing Formulas (Exact Implementation)

```javascript
// Original Price = $25.00 (2500 cents)
const subscriptionPrice = originalPrice * 0.75;  // 25% off = $18.75
const finalMainPrice = originalPrice * 0.80;     // 20% off = $20.00
const finalSubscriptionPrice = originalPrice * 0.60; // 25% + 20% = $15.00 (40% total)
```

## 🛠 Tech Stack

- **Frontend**: Liquid templates, Vanilla JavaScript (ES6), SCSS
- **Build Tools**: Sass, Babel, NPM scripts
- **Testing**: Jest (unit tests), Playwright (E2E tests)
- **Linting**: ESLint, Stylelint, Prettier
- **CI/CD**: GitHub Actions
- **Development**: Shopify CLI, VS Code integration

## 📁 Project Structure

```
shopify-assignment-theme/
├── theme/                          # Shopify theme files
│   ├── templates/
│   │   └── product.liquid         # Main product template
│   ├── sections/
│   │   └── product-main.liquid    # Product page section
│   ├── snippets/
│   │   ├── price.liquid           # Price display component
│   │   └── product-media-gallery.liquid
│   └── assets/
│       ├── product.js             # Main product functionality
│       ├── product.scss           # Styles (compiled to CSS)
│       └── product.css            # Compiled CSS
├── src/js/ui/                     # Modular JavaScript
│   ├── variant-manager.js         # Variant selection logic
│   ├── pricing.js                 # Pricing calculations
│   ├── media-gallery.js           # Gallery interactions
│   └── cart-api.js               # Shopify Cart API wrapper
├── tests/
│   ├── unit/                      # Jest unit tests
│   │   ├── pricing.test.js
│   │   └── variantManager.test.js
│   ├── e2e/                       # Playwright E2E tests
│   │   └── product-page.spec.js
│   └── setup.js                   # Test configuration
├── .vscode/                       # VS Code configuration
│   ├── tasks.json                 # Development tasks
│   ├── launch.json                # Debug configurations
│   ├── settings.json              # Editor settings
│   └── extensions.json            # Recommended extensions
├── .github/workflows/
│   └── ci.yml                     # CI/CD pipeline
└── package.json                   # Dependencies and scripts
```

## 🚦 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Shopify CLI (`npm install -g @shopify/cli @shopify/theme`)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shopify-assignment-theme
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Shopify CLI**
   ```bash
   shopify auth login --store=your-dev-store.myshopify.com
   ```

4. **Start development**
   ```bash
   npm run dev
   ```
   This starts both SCSS watching and Shopify theme development server.

### Development Workflow

1. **Local Development**: `npm run dev`
   - Starts Shopify theme dev server
   - Watches SCSS files for changes
   - Live reloads on file changes

2. **Testing**
   ```bash
   npm run test:unit     # Run Jest unit tests
   npm run test:e2e      # Run Playwright E2E tests
   npm test              # Run all tests
   ```

3. **Linting**
   ```bash
   npm run lint          # Run ESLint and Stylelint
   npm run lint:fix      # Auto-fix linting issues
   ```

4. **Building**
   ```bash
   npm run build         # Build production assets
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file for local development:

```env
SHOPIFY_STORE=your-dev-store.myshopify.com
SHOPIFY_PASSWORD=your-theme-access-token
E2E_HOST=http://localhost:9292
```

### VS Code Setup

1. Install recommended extensions (prompted automatically)
2. Use Command Palette (`Ctrl+Shift+P`) → "Tasks: Run Task" for common operations:
   - **Shopify: Theme Dev** - Start development server
   - **Run: Unit Tests** - Execute Jest tests
   - **Run: E2E Tests** - Execute Playwright tests
   - **Build & Deploy** - Build and deploy theme

### Shopify Store Configuration

#### Required Metafields

Set up these metafields in your Shopify admin for "What's Included" functionality:

1. **Product Metafields**:
   - Namespace: `subscription`
   - Key: `single`
   - Type: JSON
   - Value example:
     ```json
     {
       "title": "What's Included - Single Subscription",
       "delivery_frequency": "Monthly",
       "items": [
         "1 bag of protein powder (30 servings)",
         "Detailed nutrition guide",
         "Recipe book with 20+ recipes",
         "Free shipping"
       ]
     }
     ```

   - Namespace: `subscription`
   - Key: `double`
   - Type: JSON
   - Value example:
     ```json
     {
       "title": "What's Included - Double Subscription", 
       "delivery_frequency": "Monthly",
       "items": [
         "2 bags of protein powder (60 servings)",
         "Detailed nutrition guide",
         "Recipe book with 20+ recipes",
         "Bonus shaker bottle",
         "Free shipping"
       ]
     }
     ```

#### Product Variants Setup

Create product variants with these titles for proper flavor mapping:
- "Chocolate" - for chocolate flavor
- "Vanilla" - for vanilla flavor  
- "Orange" - for orange flavor

Ensure each variant has:
- Proper pricing (e.g., $25.00)
- Featured images for gallery
- Inventory tracking enabled

## 🧪 Testing

### Unit Tests (Jest)

Located in `tests/unit/`, these test:
- Pricing calculation accuracy
- Variant mapping logic
- Input validation
- Edge cases and error handling

**Run tests:**
```bash
npm run test:unit
npm run test:unit -- --watch     # Watch mode
npm run test:unit -- --coverage  # With coverage
```

### E2E Tests (Playwright)

Located in `tests/e2e/`, these test:
- Complete user workflows
- UI interactions and updates
- Cart functionality
- Cross-browser compatibility

**Run tests:**
```bash
npm run test:e2e
npm run test:e2e -- --headed      # With browser UI
npm run test:e2e -- --debug       # Debug mode
```

### Test Data

Tests use mock product data defined in `tests/setup.js`. Modify `createMockProduct()` to test different scenarios.

## 🚀 Deployment

### Automatic Deployment (CI/CD)

1. **Setup GitHub Secrets**:
   - `SHOPIFY_STORE`: Your store URL (e.g., `my-store.myshopify.com`)
   - `SHOPIFY_PASSWORD`: Theme access token
   - `E2E_HOST`: E2E testing URL (optional)

2. **Deployment Triggers**:
   - Push to `main` branch → Automatic deployment
   - Pull requests → Run tests and checks only

### Manual Deployment

```bash
npm run build
npm run theme:deploy
```

Or using Shopify CLI directly:
```bash
shopify theme push --store=your-store.myshopify.com
```

## 🔍 Code Quality

### Linting Configuration

- **ESLint**: JavaScript linting with recommended rules
- **Stylelint**: CSS/SCSS linting with standard configuration  
- **Prettier**: Code formatting for consistent style

### Git Hooks

Pre-commit hooks (optional setup):
```bash
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run test:unit"
```

## 🐛 Troubleshooting

### Common Issues

1. **Shopify CLI Authentication**
   ```bash
   shopify auth logout
   shopify auth login --store=your-store.myshopify.com
   ```

2. **Node Modules Issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **SCSS Compilation Errors**
   ```bash
   npm run build
   # Check for syntax errors in .scss files
   ```

4. **Test Failures**
   ```bash
   npm run test:unit -- --verbose
   npm run test:e2e -- --headed
   ```

### Performance Optimization

- CSS is minified in production builds
- JavaScript modules are optimized for browser compatibility
- Images should be optimized before upload to Shopify
- Use browser dev tools to monitor performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Style

- Follow existing code patterns
- Add tests for new functionality
- Update documentation as needed
- Ensure all checks pass in CI

## 📚 Documentation

### Architecture Decisions

- **Modular JavaScript**: Separated concerns for maintainability
- **CSS-in-SCSS**: Modern styling with variables and nesting
- **Liquid Components**: Reusable snippets for DRY principles
- **Progressive Enhancement**: Works without JavaScript (basic functionality)

### Browser Support

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation for older browsers

### Accessibility Features

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Shopify for comprehensive theme development documentation
- Jest and Playwright teams for excellent testing frameworks
- VS Code team for extensible editor platform

---

## 📞 Support

For questions or issues:

1. Check existing GitHub issues
2. Review Shopify theme documentation
3. Create a new issue with:
   - Environment details
   - Steps to reproduce
   - Expected vs actual behavior
   - Relevant logs/screenshots

**Happy coding! 🎉**