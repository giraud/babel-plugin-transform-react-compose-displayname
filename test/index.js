import {transform} from 'babel-core';
import assert from 'assert';

function transformCode(code, methodName) {
    return transform(code, {
        presets: ['es2015'],
        plugins: [['./src/index.js', {methodName}]]
    });
}

function lastLine(code) {
    return code.substring(code.lastIndexOf('\n') + 1);
}

describe('Using reactStamp method', () => {

    describe('with const', () => {
        it('should generate displayName with reactStamp only', () => {
            const code = 'const myComponent = reactStamp(React);';
            const result = lastLine(transformCode(code, 'reactStamp').code);
            assert.equal(result, 'myComponent.displayName = "myComponent";');
        });
        it('should generate displayName with compose call', () => {
            const code = 'const myComponent = reactStamp(React).compose({});';
            const result = lastLine(transformCode(code, 'reactStamp').code);
            assert.equal(result, 'myComponent.displayName = "myComponent";');
        });
    });

    describe('with named export', () => {
        it('should generate displayName', () => {
            const code = 'export const myExportComponent = reactStamp(React).compose({});';
            const result = lastLine(transformCode(code, 'reactStamp').code);

            assert.equal(result, 'myExportComponent.displayName = "myExportComponent";');
        });
    });
});

describe('Using a compose method', () => {

    it('should generate displayName', () => {
        const code = 'export const myComponent = reactCompose({});';
        const result = lastLine(transformCode(code, 'reactCompose').code);

        assert.equal(result, 'myComponent.displayName = "myComponent";');
    });

});

describe('identifierExpression', () => {

    it('should not generate displayName and not fail', () => {
        const code = 'const y = "string";';
        const result = lastLine(transformCode(code, 'compose').code);

        assert.equal(result, 'var y = "string";');
    });

});

describe('memberExpression', () => {

    it('should not generate displayName and not fail', () => {
        const code = 'const x = obj.func();';
        const result = lastLine(transformCode(code, 'compose').code);

        assert.equal(result, 'var x = obj.func();');
    });

});
