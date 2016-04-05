import { transform } from 'babel-core';
import test from 'ava';

function transformCode(code, methodName = 'reactStamp') {
  return transform(code, { presets: ['es2015'], plugins: [['../lib/index.js', {methodName}]] });
}

function lastLine(code) {
  console.log('returned', code);
  return code.substring(code.lastIndexOf('\n') + 1);
}

test('Generate displayName', (t) => {
  const code = 'const myComponent = reactStamp(React).compose({});';
  const result = lastLine(transformCode(code).code);

  t.is(result, 'myComponent.displayName = "myComponent";');
});

test('Generate displayName for named export', (t) => {
  const code = 'export const myComponent = reactStamp(React).compose({});';
  const result = lastLine(transformCode(code).code);

  t.is(result, 'myComponent.displayName = "myComponent";');
});

test('Generate displayName for other factory method', (t) => {
  const code = 'export const myComponent = reactCompose({});';
  const result = lastLine(transformCode(code).code, 'reactCompose');

  t.is(result, 'myComponent.displayName = "myComponent";');
});
