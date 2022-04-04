Private babel plugin that can:
- rewrite memoization function to add key based on module/function name 
- (_obsolete_) add a displayName to a component created by composition, using [reactStamp](https://github.com/stampit-org/react-stamp) or another function.

[![npm version](https://img.shields.io/npm/v/babel-plugin-transform-react-compose-displayname.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-transform-react-compose-displayname)

## Installation

```sh
$ yarn add -D babel-plugin-transform-react-compose-displayname
```

## Usage

**babel.config.js**

```js
module.exports = {
    plugins: ['transform-react-compose-displayname']
}
```

You can specify options:

```js
module.exports = {
    plugins: [
        ['transform-react-compose-displayname', { methodNames: ['compose'] }]
    ]
}
```

# Rewrites

## Memoize

**in**

```reason
module Selectors = {
  let getValue = (. store:store) => Reselect.memoize1(input, (input) => { ... }); 
};
```

**out**

```js
let getValue = (store) => memoize('ModuleName:getValue', [input], (input) => { ... });

```
## Add display name

**in**

```js
const MyComp = reactStamp(React).compose({
  render() { ... }
});
```

**out**

```js
const MyComp = reactStamp(React).compose({
  render() { ... }
});
MyComp.displayName = 'MyComp';
```

# License

MIT
