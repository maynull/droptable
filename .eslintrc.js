module.exports = {
  extends: 'airbnb-base',
  rules: {
    allowShortCircuit: true,
    allowTernary: true,
    'max-len': [1, 180, 2, { ignoreComments: true }],
    'quote-props': [1, 'consistent-as-needed'],
    'no-cond-assign': [2, 'except-parens'],
    radix: 0,
    'no-unused-vars': [1, { vars: 'local', args: 'none' }],
    'no-unused-expressions': 'off',
    'default-case': 0,
    'no-else-return': 0,
    'no-param-reassign': 0,
    quotes: 0,
  },
};
