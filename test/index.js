import {transform} from '@babel/core';
import assert from 'assert';

function transformCode(code, methodNames) {
    return transform(code, {
        presets: ['@babel/env'],
        plugins: [['./src/index.cjs', {methodNames}]]
    });
}

function lines(code) {
    return code.split('\n');
}

function lastLine(code) {
    return code.substring(code.lastIndexOf('\n') + 1);
}

describe('Using reactStamp method', () => {

    describe('with const', () => {
        it('should generate displayName with reactStamp only', () => {
            const code = 'const myComponent = reactStamp(React);';
            const result = lastLine(transformCode(code, ['reactStamp']).code);
            assert.equal(result, 'myComponent.displayName = "myComponent";');
        });
        it('should generate displayName with compose call', () => {
            const code = 'const myComponent = reactStamp(React).compose({});';
            const result = lastLine(transformCode(code, ['reactStamp']).code);
            assert.equal(result, 'myComponent.displayName = "myComponent";');
        });
    });

    describe('with named export', () => {
        it('should generate displayName', () => {
            const code = 'export const myExportComponent = reactStamp(React).compose({});';
            const result = lastLine(transformCode(code, ['reactStamp']).code);

            assert.equal(result, 'myExportComponent.displayName = "myExportComponent";');
        });
    });
});

describe('Using compose methods', () => {

    it('should generate displayName', () => {
        const code = 'export const compA = reactCompA({});\n const compB = reactCompB({});\nconst compC = reactCompC({});';
        const result = lines(transformCode(code, ['reactCompA', 'reactCompB']).code);

        assert.ok(result.includes('compA.displayName = "compA";'));
        assert.ok(result.includes('compB.displayName = "compB";'));
        assert.ok(!result.includes('compC.displayName = "compC";'));
    });

});

describe('identifierExpression', () => {

    it('should not generate displayName and not fail', () => {
        const code = 'const y = "string";';
        const result = lastLine(transformCode(code, ['compose']).code);

        assert.equal(result, 'var y = "string";');
    });

});

describe('memberExpression', () => {

    it('should not generate displayName and not fail', () => {
        const code = 'const x = obj.func();';
        const result = lastLine(transformCode(code, ['compose']).code);

        assert.equal(result, 'var x = obj.func();');
    });

});
