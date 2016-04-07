# Babel Plugin to add displayName to composed component
[![npm version](https://img.shields.io/npm/v/babel-plugin-transform-react-compose-displayname.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-transform-react-compose-displayname)

Automatically add a displayName to a composed component (using reactStamp or other compose function).

## Example

**In**
```js
const MyComp = reactStamp(React).compose({
  render() {
    ...
  }
});
```

**Out**
```js
const MyComp = reactStamp(React).compose({
  render() {
    ...
  }
});
MyComp.displayName = 'MyComp';
```

## Installation

```sh
$ npm install --save-dev babel-plugin-transform-react-compose-displayname
```

## Usage

**.babelrc**

```json
{
  "env": {
    "production": {
      "plugins": ["transform-react-compose-displayname"]
    }
  }
}
```

You can specify options:

```json
{
  "env": {
    "production": {
      "plugins": [
        ["transform-react-compose-displayname", {methodName: 'compose']
      ]
    }
  }
}
```

#License

MIT
