const suffixToRemove = 'Container';

function addDisplayNameStatement(t, varName) {
    const pos = varName.indexOf(suffixToRemove);
    const displayName = 0 < pos ? varName.substring(0, pos) : varName;

    // <VAR>.displayName = '<VAR>';
    return t.expressionStatement( //
        t.assignmentExpression('=', //
            t.memberExpression(t.identifier(varName), t.identifier('displayName')),  // <VAR>.displayName
            t.stringLiteral(displayName)));
}

export default function build({types: t}) {
    return {
        visitor: {
            VariableDeclaration(path, state) {
                if (1 === path.node.declarations.length) {
                    const declarator = path.node.declarations[0];
                    if (t.isIdentifier(declarator.id)) {
                        const varName = declarator.id.name;
                        const initExpression = declarator.init;
                        const {methodNames = ['reactStamp']} = state.opts;
                        if (methodNames && t.isCallExpression(initExpression)) {
                            let callee = initExpression.callee;
                            if (t.isMemberExpression(initExpression.callee)) {
                                callee = callee.object.callee;
                            }
                            if (callee && methodNames.includes(callee.name)) {
                                const statementPath = t.isExportNamedDeclaration(path.parentPath) ? path.parentPath : path;
                                statementPath.insertAfter(addDisplayNameStatement(t, varName));
                            }
                        }
                    }
                }
            }
        }
    };
}
