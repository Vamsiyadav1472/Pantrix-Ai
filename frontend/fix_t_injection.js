const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const screensDir = path.join(__dirname, 'screens');
const files = fs.readdirSync(screensDir).filter(f => f.endsWith('.js'));
const skipFiles = ['HomeScreen.js', 'AppSettingsScreen.js']; 

let fixedCount = 0;

for (const file of files) {
  if (skipFiles.includes(file)) continue;

  const filePath = path.join(screensDir, file);
  const code = fs.readFileSync(filePath, 'utf8');
  
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx'],
    });
  } catch (e) {
    console.error(`Error parsing ${file}:`, e);
    continue;
  }

  let madeChanges = false;

  // We need to inject const { t } = useTranslation(); into ANY function that uses t(...) but doesn't have it.
  traverse(ast, {
    CallExpression(pathNode) {
      if (t.isIdentifier(pathNode.node.callee, { name: 't' })) {
        const fnParent = pathNode.getFunctionParent();
        if (fnParent && fnParent.node.body && fnParent.node.body.body) {
           const body = fnParent.node.body.body;
           const hasT = body.some(stmt => 
              t.isVariableDeclaration(stmt) && 
              stmt.declarations[0].id.properties && 
              stmt.declarations[0].id.properties.some(p => p.key && p.key.name === 't')
           );
           
           if (!hasT) {
             const useTransDecl = t.variableDeclaration('const', [
               t.variableDeclarator(
                 t.objectPattern([t.objectProperty(t.identifier('t'), t.identifier('t'), false, true)]),
                 t.callExpression(t.identifier('useTranslation'), [])
               )
             ]);
             body.unshift(useTransDecl);
             madeChanges = true;
           }
        }
      }
    }
  });

  if (madeChanges) {
    const output = generate(ast, { retainLines: false }, code);
    fs.writeFileSync(filePath, output.code);
    console.log(`Fixed missing 't' in: ${file}`);
    fixedCount++;
  }
}

console.log(`Fixed ${fixedCount} files.`);
