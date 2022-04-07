let suffixToRemove = "Container";

function addDisplayNameStatement(t, varName) {
    let pos = varName.indexOf(suffixToRemove);
    let displayName = 0 < pos ? varName.substring(0, pos) : varName;

    // <VAR>.displayName = '<VAR>';
    return t.expressionStatement( //
        t.assignmentExpression("=", //
            t.memberExpression(t.identifier(varName), t.identifier("displayName")), // <VAR>.displayName
            t.stringLiteral(displayName)));
}

function extractModuleName(fileOpts) {
    let sourceFileName = fileOpts.sourceFileName;
    let name = sourceFileName && sourceFileName.split("\\").pop().split("/").pop(); // for perfs
    let dotPos = name && name.indexOf(".");
    return dotPos > 0 ? name.substring(0, dotPos) : (name || "Unknown");
}

export default function build({types: t}) {
    return {
        visitor: {
            /*
             Rewrite
               Reselect.memoize?(x, y, fn)
             To
               Reselect.memoize("<module>:<functionName>", [x, y], fn)
             */
            CallExpression(path, state) {
                if (t.isMemberExpression(path.node.callee)) {
                    let callee = path.node.callee;
                    if (t.isIdentifier(callee.property) && callee.property.name.startsWith("memoize")) {
                        if (t.isIdentifier(callee.object) && callee.object.name === "Reselect") {
                            if (path.node.arguments.length > 1 && !t.isStringLiteral(path.node.arguments[0])) {
                                // We found a call expression : Reselect.memoize??(x, y, ...)
                                let parentFunctionNode = path.getFunctionParent().node;
                                if (parentFunctionNode) {
                                    let name = t.isIdentifier(parentFunctionNode.id) ? parentFunctionNode.id.name: "anonymous";
                                    let extraParams = [];
                                    // if parent function, add params as extra inputs
                                    let grandParentFunction = path.getFunctionParent().getFunctionParent();
                                    if (grandParentFunction) {
                                        if (grandParentFunction.node.params && grandParentFunction.node.params.length > 0) {
                                            // var x = function(y) { ... }
                                            extraParams = grandParentFunction.node.params
                                            if (t.isIdentifier(grandParentFunction.node.id)) {
                                                name = grandParentFunction.node.id.name;
                                            } else {
                                                if (t.isVariableDeclarator(grandParentFunction.parent)) {
                                                    name = grandParentFunction.parent.id.name;
                                                }
                                            }
                                        }
                                    }

                                    // function getSomething(...) { Reselect.memoize() =
                                    let moduleName = extractModuleName(state.file.opts);

                                    // anonymous with grandParent
                                    let functionName = name;

                                    let inputs = [].concat(path.node.arguments); // create new array
                                    let computeFunction = inputs.pop();
                                    let newInputs = inputs.concat(extraParams);
                                    let newArgs = [t.stringLiteral(moduleName + ':' + functionName), t.arrayExpression(newInputs), computeFunction];

                                    path.replaceWith(t.callExpression( //
                                        t.memberExpression(t.identifier('Reselect'), t.identifier('memoize')), newArgs));
                                }
                            }
                        }
                    }
                }
            },

            VariableDeclaration(path, state) {
                if (1 === path.node.declarations.length) {
                    let declarator = path.node.declarations[0];
                    if (t.isIdentifier(declarator.id)) {
                        let varName = declarator.id.name;
                        let initExpression = declarator.init;
                        let {methodNames = ["reactStamp"]} = state.opts;
                        if (methodNames && t.isCallExpression(initExpression)) {
                            let callee = initExpression.callee;
                            if (t.isMemberExpression(initExpression.callee)) {
                                callee = callee.object.callee;
                            }
                            if (callee && methodNames.indexOf(callee.name) >= 0) {
                                let statementPath = t.isExportNamedDeclaration(path.parentPath) ? path.parentPath : path;
                                statementPath.insertAfter(addDisplayNameStatement(t, varName));
                            }
                        }
                    }
                }
            },
        },
    };
}
