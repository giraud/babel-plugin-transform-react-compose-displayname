const composeMethodName = 'reactComponent';
const suffixToRemove = 'Container';

function addDisplayName(t, varName) {
  const pos = varName.indexOf(suffixToRemove);
  const displayName = 0 < pos ? varName.substring(0, pos) : varName;

  // <VAR>.displayName = '<VAR>';
  return t.expressionStatement(
            t.assignmentExpression('=',
              t.memberExpression(t.identifier(varName), t.identifier('displayName')),  // <VAR>.displayName
              t.stringLiteral(displayName)
            )
         );
}

export default function build({ types: t }) {
  return {
    visitor: {
      VariableDeclaration(path) {
        if (1 === path.node.declarations.length) {
          const declarator = path.node.declarations[0];
          if (t.isIdentifier(declarator.id)) {
            const varName = declarator.id.name;
            const initExpression = declarator.init;
            if (t.isCallExpression(initExpression) && composeMethodName === initExpression.callee.name) {
              const statementPath = t.isExportNamedDeclaration(path.parentPath) ? path.parentPath : path;
              statementPath.insertAfter(addDisplayName(t, varName));
            }
          }
        }
      }
    }
  };
}
