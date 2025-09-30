module.exports = {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: [
    'theme/assets/product.css',  // Ignore compiled CSS
    'node_modules/**/*'
  ],
  rules: {
    'selector-class-pattern': null,
    'scss/dollar-variable-pattern': null,
    'declaration-block-trailing-semicolon': 'always',
    'block-no-empty': true,
    'alpha-value-notation': null,
    'color-function-notation': null,
    'selector-pseudo-element-colon-notation': 'single'
  }
};