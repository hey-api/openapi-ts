/**
 * Custom ESLint rule for object-shorthand
 * Enforces the use of shorthand syntax for object properties and methods
 * 
 * This rule can be contributed back to Oxlint as it's a general-purpose rule
 * not specific to this repository.
 */

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce the use of shorthand syntax for object properties and methods',
      category: 'ECMAScript 6',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
    messages: {
      expectedPropertyShorthand: 'Expected property shorthand.',
      expectedMethodShorthand: 'Expected method shorthand.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();

    return {
      Property(node) {
        // Skip if it's a spread property or computed property
        if (node.type === 'SpreadElement' || node.computed) {
          return;
        }

        // Check for property shorthand (e.g., { x } instead of { x: x })
        if (
          node.value.type === 'Identifier' &&
          node.key.type === 'Identifier' &&
          node.key.name === node.value.name &&
          !node.shorthand &&
          !node.method
        ) {
          context.report({
            node,
            messageId: 'expectedPropertyShorthand',
            fix(fixer) {
              // Replace "key: value" with "key"
              const keyText = sourceCode.getText(node.key);
              return fixer.replaceTextRange(
                [node.key.range[0], node.value.range[1]],
                keyText
              );
            },
          });
        }

        // Check for method shorthand (e.g., { foo() {} } instead of { foo: function() {} })
        if (
          node.value.type === 'FunctionExpression' &&
          !node.value.generator &&
          !node.value.async &&
          !node.method &&
          node.key.type === 'Identifier'
        ) {
          context.report({
            node,
            messageId: 'expectedMethodShorthand',
            fix(fixer) {
              const keyText = sourceCode.getText(node.key);
              const params = sourceCode.getText(node.value).match(/function\s*\((.*?)\)/)?.[1] || '';
              const body = sourceCode.getText(node.value.body);
              
              return fixer.replaceText(node, `${keyText}(${params}) ${body}`);
            },
          });
        }
      },
    };
  },
};

const plugin = {
  meta: {
    name: 'object-shorthand-custom',
    version: '1.0.0',
  },
  rules: {
    'enforce': rule,
  },
};

export default plugin;
