import {transform} from "@babel/core";
import assert from "assert";

function transformCode(code, methodNames) {
    return transform(code, {
        presets: ["@babel/env"],
        plugins: [["./src/index.js", {methodNames}]],
    });
}

function lines(code) {
    return code.split("\n");
}

function lastLine(code) {
    return code.substring(code.lastIndexOf("\n") + 1);
}

function flatten(code) {
    return code.replace('"use strict";', '').split('\n').map(x => x.trim()).join('');
}

describe("Memoization", () => {
    it("should rewrite for one param", () => {
        let code = "function getPerspectives(store) { return Reselect.memoize1(store.perspectives, function (param) { return param; }); }";
        let result = flatten(transformCode(code, [""]).code);
        assert.equal(result,
            'function getPerspectives(store) {return Reselect.memoize("Unknown:getPerspectives", [], [store.perspectives], function (param) {return param;});}');
    });

    it("should rewrite for many params", () => {
        let code = "function getXxx(store) { return Reselect.memoize3(in1, in2(y), in3, () => { return _; }); }";
        let result = flatten(transformCode(code, [""]).code);
        assert.equal(result,
            'function getXxx(store) {return Reselect.memoize("Unknown:getXxx", [], [in1, in2(y), in3], function () {return _;});}');
    });

    it("should rewrite with extra params added", () => {
        let code = "var getX = function(extra1, extra2) { return function(store) { return Reselect.memoize1(store.in, function() { return b; }); }; };";
        let result = flatten(transformCode(code, [""]).code);
        assert.equal(result,
            'var getX = function getX(extra1, extra2) {return function (store) {return Reselect.memoize("Unknown:getX", [extra1, extra2], [store["in"]], function () {return b;});};};');
    });
});

describe('Using reactStamp method', () => {

    describe('with const', () => {
        it('should generate displayName with reactStamp only', () => {
            let code = 'const myComponent = reactStamp(React);';
            let result = lastLine(transformCode(code, ['reactStamp']).code);
            assert.equal(result, 'myComponent.displayName = "myComponent";');
        });
        it('should generate displayName with compose call', () => {
            let code = 'const myComponent = reactStamp(React).compose({});';
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
