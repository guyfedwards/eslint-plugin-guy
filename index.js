const plugins = [
  'import',
  'node',
  'prettier',
  'promise',
  'standard',
  'react',
  'jest',
  '@typescript-eslint',
];
const commonConfigs = [
  'standard',
  'prettier',
  'prettier/@typescript-eslint',
];
const nodeConfigs = [
  ...commonConfigs,
];
const browserConfigs = [
  ...commonConfigs,
];
const commonRecommendedConfigs = [
  'prettier/recommended',
  'jest/recommended',
  '@typescript-eslint/recommended',
];
const nodeRecommendedConfigs = [
  'node/recommended',
  ...commonRecommendedConfigs,
];
const browserRecommendedConfigs = [
  'react/recommended',
  ...commonRecommendedConfigs,
];

// check if rule is already part of a plugin
function isPluginRule(ruleName) {
  for (const pluginName of plugins) {
    if (ruleName.includes(`${pluginName}/`)) {
      return true;
    }
  }
  return false;
}

const requirePlugin = pluginName => {
  return pluginName.startsWith('@')
    ? require(`${pluginName}/eslint-plugin`)
    : require(`eslint-plugin-${pluginName}`);
}

// prefix plugin rules with name of plugin
let pluginRules = {};
for (const pluginName of plugins) {
  const plugin = requirePlugin(pluginName);

  Object.keys(plugin.rules).forEach(ruleName => {
    pluginRules[`${pluginName}/${ruleName}`] = plugin.rules[ruleName];
  });
}

function getConfigRules(configs) {
  // prefix config rules with name of config
  let configRules = {};
  for (const configName of configs) {
    const config = require(`eslint-config-${configName}`);

    Object.keys(config.rules).forEach(ruleName => {
      if (isPluginRule(ruleName)) {
        configRules[`guy/${ruleName}`] = config.rules[ruleName];
      } else {
        configRules[ruleName] = config.rules[ruleName];
      }
    });
  }

  return configRules;
}

function getPluginRecommendedRules(pluginRecommendedConfigs) {
  // plugins often have recommended rules, we want to use them but the
  // rules are prefixed now so we must update the recommended rules names
  // to reflect that
  let pluginRecommendedRules = {};
  for (const recName of pluginRecommendedConfigs) {
    const [pluginName, configName] = recName.split('/');
    const plugin = requirePlugin(pluginName);
    const recommendedRules = plugin.configs[configName].rules;

    Object.keys(recommendedRules).forEach(ruleName => {
      // only prefix plugin rules, not eslint baserules
      if (ruleName.startsWith(pluginName)) {
        pluginRecommendedRules[`guy/${ruleName}`] = recommendedRules[ruleName];
      }
    });
  }

  return pluginRecommendedRules;
}

const commonOverrides = {
  semi: ['error', 'always'],
  'guy/prettier/prettier': [
    'error',
    {
      singleQuote: true,
      trailingComma: 'es5'
    }
  ],
  'guy/import/order': ['error'],
  'sort-keys': ['error', 'asc', { natural: true }],
  'guy/@typescript-eslint/no-var-requires': 'off',
  'guy/@typescript-eslint/explicit-member-accessibility': 'off'
}

const commonParserOptions = {
  ecmaVersion: 6,
  sourceType: 'module',
};

const parser = '@typescript-eslint/parser';

module.exports = {
  configs: {
    backend: {
      env: {
        node: true,
        jest: true,
        es6: true,
      },
      plugins: ['guy'],
      rules: {
        // if rules are coming from a plugin they need to be prefixed with
        // `guy/...`
        ...getPluginRecommendedRules(nodeRecommendedConfigs),
        ...getConfigRules(nodeConfigs),
        // overrides
        ...commonOverrides,
        'guy/node/shebang': 0,
        'guy/node/no-unsupported-features/es-syntax': ['error', {
          ignores: ['modules']
        }],
        // imports is handled by typescript
        'guy/node/no-missing-import': 0,
        'guy/node/no-unpublished-import': 0,
      },
      parser,
      parserOptions: {
        ...commonParserOptions
      }
    },
    frontend: {
      env: {
        browser: true,
        jest: true,
        es6: true
      },
      plugins: ['guy'],
      rules: {
        // if rules are coming from a plugin they need to be prefixed with
        // `guy/...`
        ...getPluginRecommendedRules(browserRecommendedConfigs),
        ...getConfigRules(browserConfigs),
        // overrides
        ...commonOverrides,
      },
      parser,
      parserOptions: {
        ...commonParserOptions,
        ecmaFeatures: {
          jsx: true
        }
      },
      settings: {
        react: {
          version: 'detect'
        }
      }
    }
  },
  rules: pluginRules
};
