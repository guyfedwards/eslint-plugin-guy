# eslint-plugin-guy

## Installation
```
$ yarn add --dev --tilde prettier@1.19.1 eslint@6.8.0 git+ssh://git@github.com:guyfedwards/eslint-plugin-guy
```

## Usage
#### Frontend
Add to `.eslint.yaml`
```
extends:
  - 'plugin:guy/frontend'
```
#### Node
Add to `.eslint.yaml`
```
extends:
  - 'plugin:guy/backend'
```

## Adding new plugins/config
Add name to the relative `plugins`/`configs` array in `index.js`.  
If a plugin being added has recommended config, add that to `pluginRecommendedConfigs` array.
