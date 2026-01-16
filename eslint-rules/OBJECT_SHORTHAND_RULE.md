# Custom Object Shorthand Rule

## Overview

This is a custom ESLint rule that enforces the use of ES6 shorthand syntax for object properties and methods. It is implemented as a JavaScript plugin that works with both ESLint and Oxlint.

## Purpose

This rule was created to address the missing `object-shorthand` rule in Oxlint v1.39.0. It provides equivalent functionality to ESLint's built-in `object-shorthand` rule.

## Rule Details

This rule enforces two types of shorthand:

### 1. Property Shorthand

When an object property has the same name as the variable being assigned:

```javascript
// ❌ Bad
const x = 1;
const obj = { x: x };

// ✅ Good  
const x = 1;
const obj = { x };
```

### 2. Method Shorthand

When an object method is defined using function expression:

```javascript
// ❌ Bad
const obj = {
  foo: function() {
    return 1;
  }
};

// ✅ Good
const obj = {
  foo() {
    return 1;
  }
};
```

## Auto-fix

This rule includes auto-fix capabilities. Running `oxlint --fix` will automatically convert:
- `{ x: x }` → `{ x }`
- `{ foo: function() {} }` → `{ foo() {} }`

## Contributing to Oxlint

This rule is implemented as a **general-purpose, non-proprietary rule** that could be contributed back to the Oxlint project. It follows ESLint's plugin API and is compatible with both ESLint and Oxlint.

### Steps to Contribute

If you'd like to contribute this rule to Oxlint's native rule set (written in Rust):

1. **File an issue** on the [Oxlint GitHub repository](https://github.com/oxc-project/oxc/issues)
   - Title: "Add native `object-shorthand` rule"
   - Reference ESLint's implementation: https://eslint.org/docs/latest/rules/object-shorthand
   - Link to this custom implementation as a working reference

2. **Implement in Rust** (optional - Oxlint team may implement)
   - Convert the logic from `eslint-rules/object-shorthand.js` to Rust
   - Follow Oxlint's rule development guidelines
   - Include tests matching ESLint's behavior

3. **Submit a Pull Request** to Oxlint
   - Include comprehensive tests
   - Update documentation
   - Ensure auto-fix works correctly

## Interim Solution

Until `object-shorthand` is implemented natively in Oxlint, this custom JS plugin provides a working solution with:
- ✅ Full rule functionality
- ✅ Auto-fix support
- ✅ Compatible with both ESLint and Oxlint
- ⚠️ Slightly slower than a native Rust implementation (but still much faster than full ESLint)

## Usage

The rule is already configured in `.oxlintrc.json`:

```json
{
  "jsPlugins": [
    {
      "name": "object-shorthand-custom",
      "specifier": "./eslint-rules/object-shorthand.js"
    }
  ],
  "rules": {
    "object-shorthand-custom/enforce": "error"
  }
}
```

## Implementation Details

- **File**: `eslint-rules/object-shorthand.js`
- **Plugin name**: `object-shorthand-custom`
- **Rule name**: `enforce`
- **Type**: Suggestion (style)
- **Fixable**: Yes (code)
- **Compatible with**: ESLint v9+, Oxlint v1.39.0+

## Testing

Test file: `/tmp/test-object-shorthand.ts` demonstrates the rule catches:
- Property shorthand violations
- Method shorthand violations
- Provides auto-fixes for both cases

## Future

Once Oxlint implements `object-shorthand` natively:
1. Remove the custom plugin from `.oxlintrc.json`
2. Replace `object-shorthand-custom/enforce` with `object-shorthand` in rules
3. The custom rule file can be kept for reference or removed
