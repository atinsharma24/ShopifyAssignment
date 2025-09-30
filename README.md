# Shopify Subscription Product Theme

A complete, production-ready Shopify theme implementation featuring dynamic product variants, subscription logic, pricing calculations, and comprehensive testing. Built for the Shopify Developer Assignment with modern development practices and automated workflows.

## 🚀 Features

### Core Functionality
- **Dynamic Purchase Modes**: Single and double drink subscriptions with UI adaptation
- **Flavor Selection**: Interactive swatches for Chocolate, Vanilla, and Orange flavors
- **Smart Pricing**: Automatic subscription (25%) and site-wide (20%) discount calculations
- **Variant Mapping**: Intelligent mapping between user selections and Shopify variants
- **Cart Integration**: Full Ajax cart API integration with error handling
- **Metafields Support**: Dynamic "What's Included" content from product metafields

### Technical Features
- **Modern JavaScript**: ES6 modules with clean separation of concerns
- **Responsive Design**: Mobile-first SCSS with accessibility features
- **Comprehensive Testing**: Unit tests (Jest) and E2E tests (Playwright)
- **CI/CD Pipeline**: Automated testing, linting, and deployment
- **VS Code Integration**: Tasks, debugging, and extension recommendations
- **Theme Check**: Shopify best practices validation

## 📋 Requirements

- Node.js 18+
- npm or yarn
- Shopify CLI
- Ruby 3.0+ (for Theme Check)
- VS Code (recommended)

## 🛠️ Quick Start

### 1. Initial Setup

```bash
# Clone and navigate to project
cd ShopifyAssignment5

# Install dependencies
npm ci

# Setup Shopify CLI (if not already done)
npm install -g @shopify/cli @shopify/theme
shopify auth login

# Configure your store
cp shopify.theme.toml.example shopify.theme.toml
# Edit shopify.theme.toml with your store details
```

### 2. Development

```bash
# Start development server (SCSS watch + Shopify theme dev)
npm run dev

# Or start components separately
npm run watch:scss    # SCSS compilation
shopify theme dev     # Shopify local development
```

### 3. Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit     # Jest unit tests
npm run test:e2e      # Playwright E2E tests
npm run test:watch    # Jest in watch mode

# Run linting
npm run lint
```

### 4. Deployment

```bash
# Build production assets
npm run build

# Deploy to your development store
npm run theme:deploy

# Or use the combined command
npm run build && npm run theme:deploy
```

## 🏗️ Project Structure

```
ShopifyAssignment5/
├── .github/workflows/          # CI/CD pipeline
├── .vscode/                    # VS Code configuration
├── theme/                      # Shopify theme files
│   ├── templates/
│   │   └── product.liquid      # Main product template
│   ├── sections/
│   │   └── product-main.liquid # Product section
│   ├── snippets/
│   │   ├── price-display.liquid
│   │   └── flavor-swatches.liquid
│   └── assets/
│       ├── product.js          # Main product functionality
│       ├── product.scss        # Styles
│       └── product.css         # Compiled CSS
├── src/js/                     # Source JavaScript modules
│   ├── ui/
│   │   ├── variant-manager.js  # Variant selection logic
│   │   ├── pricing.js          # Price calculations
│   │   ├── media-gallery.js    # Image gallery
│   │   └── cart-api.js         # Cart API integration
│   └── utils/
│       └── currency.js         # Currency utilities
├── tests/                      # Test suites
│   ├── unit/                   # Jest unit tests
│   ├── e2e/                    # Playwright E2E tests
│   └── setup.js                # Test configuration
└── docs/                       # Documentation
```

## 🧪 Testing Strategy

### Unit Tests (Jest)
Tests core business logic including:
- **Pricing calculations**: Verify discount formulas and edge cases
- **Variant mapping**: Ensure correct variant selection logic
- **Form validation**: Test input validation and error handling

### End-to-End Tests (Playwright)
Tests complete user workflows:
- **Mode switching**: Single ↔ Double subscription modes
- **Flavor selection**: Interactive swatch behavior
- **Price updates**: Real-time pricing changes
- **Cart functionality**: Add to cart and error handling
- **Accessibility**: Keyboard navigation and screen readers
- **Responsive design**: Mobile and tablet viewports

### Performance Testing
- **Lighthouse CI**: Automated performance and accessibility audits
- **Bundle analysis**: JavaScript and CSS optimization
- **Load testing**: Cart API and theme performance

## 💰 Pricing Logic

The pricing system implements a clear hierarchy of discounts:

```javascript
// Base price example: $100.00 (10000 cents)
const basePrice = 10000;

// Step 1: Subscription discount (25% off)
const subscriptionPrice = basePrice * 0.75; // $75.00

// Step 2: Site-wide discount (20% off everything)
const finalMainPrice = basePrice * 0.80;        // $80.00
const finalSubscriptionPrice = subscriptionPrice * 0.80; // $60.00

// Formula: Final subscription = base * 0.75 * 0.80 = base * 0.60
```

### Double Mode Pricing
- Prices are calculated per item, then multiplied by quantity
- Per-serving pricing is displayed for transparency
- Cart API receives appropriate quantity/variant combinations

## 🎯 Variant Mapping

The system maps user selections to Shopify variants using the following logic:

### Single Mode
```javascript
// Selection: { mode: 'single', flavor: 'Chocolate' }
// Maps to variant with title containing: 'Single' + 'Chocolate'
```

### Double Mode
```javascript
// Selection: { mode: 'double', flavor1: 'Chocolate', flavor2: 'Vanilla' }
// Maps to variant with title containing: 'Double' + 'Chocolate' + 'Vanilla'
```

### Expected Variant Structure
```json
{
  "variants": [
    {
      "id": 111,
      "title": "Single Chocolate Subscription",
      "options": ["Single", "Chocolate", "Subscription"],
      "price": 2500
    },
    {
      "id": 211,
      "title": "Double Chocolate Vanilla Subscription", 
      "options": ["Double", "Chocolate", "Vanilla", "Subscription"],
      "price": 4500
    }
  ]
}
```

## 📊 Metafields Configuration

### Required Metafields
Configure these metafields in your Shopify admin:

```json
{
  "product.metafields.subscription.single": {
    "type": "rich_text",
    "value": "<p><strong>Delivery:</strong> Monthly delivery</p><ul><li>1 premium drink mix</li><li>Recipe cards</li><li>Free shipping</li></ul>"
  },
  "product.metafields.subscription.double": {
    "type": "rich_text", 
    "value": "<p><strong>Delivery:</strong> Monthly delivery</p><ul><li>2 premium drink mixes</li><li>Recipe cards</li><li>Free shipping</li><li>10% bulk discount</li></ul>"
  }
}
```

## 🔧 VS Code Integration

### Recommended Extensions
Install these extensions for the best development experience:

- **Shopify Liquid** (`Shopify.theme-check-vscode`)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Stylelint** (`stylelint.vscode-stylelint`)
- **Playwright Test** (`ms-playwright.playwright`)
- **SCSS IntelliSense** (`mrmlnc.vscode-scss`)

### Available Tasks
Access via Command Palette (`Ctrl+Shift+P`) → "Tasks: Run Task":

- **Shopify: Theme Dev** - Start local development server
- **Start: SCSS Watch** - Watch and compile SCSS files
- **Dev: Start All** - Start both SCSS watch and theme dev
- **Test: Unit Tests** - Run Jest unit tests
- **Test: E2E Tests** - Run Playwright E2E tests
- **Build & Deploy** - Build assets and deploy to store

### Debugging
- **Jest Debugging**: Use "Debug Jest Tests" launch configuration
- **Browser Debugging**: Use "Launch Chrome for Debugging"
- **Network Inspection**: Built-in tools for API debugging

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow
The pipeline automatically:

1. **Code Quality**: ESLint, Stylelint, Prettier
2. **Testing**: Jest unit tests with coverage
3. **Theme Check**: Shopify best practices validation
4. **E2E Testing**: Playwright tests (if secrets provided)
5. **Security**: npm audit for vulnerabilities
6. **Performance**: Lighthouse audits
7. **Deployment**: Auto-deploy to dev store on main branch

### Required Secrets
Configure these in your GitHub repository settings:

```
SHOPIFY_STORE=your-dev-store.myshopify.com
SHOPIFY_PASSWORD=shpat_xxxxxxxxxxxxx
LHCI_GITHUB_APP_TOKEN=xxxxx (optional, for Lighthouse)
```

### Branch Strategy
- **main**: Production-ready code, auto-deploys to dev store
- **develop**: Integration branch for features
- **feature/***: Feature development branches

## 🌐 Environment Configuration

### Local Development
```bash
# .env.local (create this file)
SHOPIFY_STORE=your-dev-store.myshopify.com
SHOPIFY_PASSWORD=shpat_xxxxxxxxxxxxx
E2E_HOST=http://localhost:9292
```

### Production
```bash
# Production environment variables
NODE_ENV=production
SHOPIFY_STORE=your-live-store.myshopify.com
SHOPIFY_PASSWORD=shpat_xxxxxxxxxxxxx
```

## 📝 Acceptance Checklist

Use this checklist to verify implementation completeness:

### Core Functionality
- [ ] ✅ Page loads with Single + Chocolate selected by default
- [ ] ✅ Mode switching shows/hides appropriate flavor selectors
- [ ] ✅ Flavor selection updates UI and calculations
- [ ] ✅ Price updates reflect correct formulas (25% + 20% discounts)
- [ ] ✅ "What's Included" content updates per mode
- [ ] ✅ Add to cart successfully adds correct variants
- [ ] ✅ Cart shows correct quantities and totals

### User Experience
- [ ] ✅ All interactions provide visual feedback
- [ ] ✅ Error states are handled gracefully
- [ ] ✅ Loading states prevent double-submissions
- [ ] ✅ Form validation prevents invalid submissions
- [ ] ✅ Success/error messages are clear and helpful

### Accessibility
- [ ] ✅ Keyboard navigation works for all interactive elements
- [ ] ✅ Screen readers can navigate and understand content
- [ ] ✅ ARIA labels and roles are properly implemented
- [ ] ✅ Color contrast meets WCAG 2.1 AA standards
- [ ] ✅ Focus indicators are visible and consistent

### Performance
- [ ] ✅ Page loads in under 3 seconds
- [ ] ✅ JavaScript is optimized and minified
- [ ] ✅ CSS is optimized and minified
- [ ] ✅ Images are optimized for web
- [ ] ✅ No console errors or warnings

### Testing
- [ ] ✅ Unit tests cover pricing calculations
- [ ] ✅ Unit tests cover variant mapping logic
- [ ] ✅ E2E tests cover complete user workflows
- [ ] ✅ Tests pass in CI/CD pipeline
- [ ] ✅ Code coverage meets minimum thresholds

### Developer Experience
- [ ] ✅ VS Code tasks work correctly
- [ ] ✅ Linting passes without errors
- [ ] ✅ Build process completes successfully
- [ ] ✅ Development server starts without issues
- [ ] ✅ Documentation is complete and accurate

## 🐛 Troubleshooting

### Common Issues

#### Shopify CLI Authentication
```bash
shopify auth logout
shopify auth login
```

#### SCSS Compilation Errors
```bash
npm run build:scss
# Check for syntax errors in .scss files
```

#### Test Failures
```bash
# Clear Jest cache
npm test -- --clearCache

# Run specific test file
npm test tests/unit/pricing.test.js

# Debug test with VS Code
# Use "Debug Jest Current File" launch configuration
```

#### Theme Deploy Issues
```bash
# Verify store credentials
shopify theme list

# Check theme permissions
shopify theme pull --live
```

### Performance Issues
- Check bundle size: `npm run build && ls -la theme/assets/`
- Profile JavaScript: Use Chrome DevTools Performance tab
- Optimize images: Use Shopify's image transformation URLs
- Monitor network requests: Check for unnecessary API calls

### Development Server Issues
```bash
# Kill existing processes
pkill -f "shopify theme dev"
pkill -f "sass --watch"

# Restart development
npm run dev
```

## 📚 Additional Resources

### Shopify Documentation
- [Shopify Theme Development](https://shopify.dev/themes)
- [Liquid Template Language](https://shopify.github.io/liquid/)
- [Ajax Cart API](https://shopify.dev/api/ajax/reference/cart)
- [Product Object](https://shopify.dev/api/liquid/objects/product)

### Testing Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://testing-library.com/docs/)

### Development Tools
- [VS Code Shopify Extensions](https://marketplace.visualstudio.com/search?term=shopify&target=VSCode)
- [Shopify CLI](https://shopify.dev/themes/tools/cli)
- [Theme Check](https://shopify.dev/themes/tools/theme-check)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add tests for new functionality
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support and questions:
- 📧 Email: [your-email@domain.com]
- 💬 GitHub Issues: [Create an issue](../../issues)
- 📖 Documentation: [Wiki](../../wiki)

---

**Built with ❤️ for Shopify theme development**