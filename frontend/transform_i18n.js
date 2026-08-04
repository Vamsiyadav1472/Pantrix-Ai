const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const screensDir = path.join(__dirname, 'screens');
const localesDir = path.join(__dirname, 'locales');

// Load existing EN dict
const enDictPath = path.join(localesDir, 'en.json');
let enDict = {};
if (fs.existsSync(enDictPath)) {
  enDict = JSON.parse(fs.readFileSync(enDictPath, 'utf8'));
}

const files = fs.readdirSync(screensDir).filter(f => f.endsWith('.js'));
const skipFiles = ['HomeScreen.js', 'AppSettingsScreen.js']; // already done manually

let totalKeysExtracted = 0;

for (const file of files) {
  if (skipFiles.includes(file)) continue;

  const filePath = path.join(screensDir, file);
  const code = fs.readFileSync(filePath, 'utf8');
  
  const screenName = file.replace('.js', '');
  if (!enDict[screenName]) {
    enDict[screenName] = {};
  }

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

  let hasUseTranslationImport = false;
  let componentFunction = null;

  // Track if we made changes
  let madeChanges = false;

  traverse(ast, {
    ImportDeclaration(path) {
      if (path.node.source.value === 'react-i18next') {
        hasUseTranslationImport = true;
      }
    },
    // Find the default export component to inject useTranslation
    ExportDefaultDeclaration(pathNode) {
      const decl = pathNode.node.declaration;
      if (t.isFunctionDeclaration(decl)) {
        componentFunction = pathNode.get('declaration');
      } else if (t.isIdentifier(decl)) {
        // e.g. export default MyScreen;
        // Need to find the declaration of MyScreen
      }
    },
    JSXText(pathNode) {
      const text = pathNode.node.value;
      const cleanText = text.replace(/\\n/g, '').trim();
      
      // Skip empty or purely whitespace/symbol text
      if (cleanText.length > 0 && /[a-zA-Z]/.test(cleanText)) {
        // Generate a valid key
        let key = cleanText.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30).replace(/_+/g, '_').replace(/_$/, '');
        if (!key) key = 'text';
        
        // Ensure unique key if duplicate with different value
        let finalKey = key;
        let counter = 1;
        while (enDict[screenName][finalKey] && enDict[screenName][finalKey] !== cleanText) {
          finalKey = `${key}_${counter}`;
          counter++;
        }

        enDict[screenName][finalKey] = cleanText;
        totalKeysExtracted++;
        madeChanges = true;

        // Replace JSXText with {t('ScreenName.key')}
        const callExpression = t.callExpression(
          t.identifier('t'),
          [t.stringLiteral(`${screenName}.${finalKey}`)]
        );
        const jsxExpression = t.jsxExpressionContainer(callExpression);
        pathNode.replaceWith(jsxExpression);
      }
    },
    // Handle some common string props like title, placeholder
    JSXAttribute(pathNode) {
      const name = pathNode.node.name.name;
      if (['title', 'placeholder', 'label'].includes(name) && t.isStringLiteral(pathNode.node.value)) {
        const text = pathNode.node.value.value.trim();
        if (text.length > 0 && /[a-zA-Z]/.test(text)) {
          let key = name + '_' + text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20).replace(/_+/g, '_').replace(/_$/, '');
          
          let finalKey = key;
          let counter = 1;
          while (enDict[screenName][finalKey] && enDict[screenName][finalKey] !== text) {
            finalKey = `${key}_${counter}`;
            counter++;
          }

          enDict[screenName][finalKey] = text;
          totalKeysExtracted++;
          madeChanges = true;

          const callExpression = t.callExpression(
            t.identifier('t'),
            [t.stringLiteral(`${screenName}.${finalKey}`)]
          );
          pathNode.node.value = t.jsxExpressionContainer(callExpression);
        }
      }
    }
  });

  if (madeChanges) {
    // Inject import if needed
    if (!hasUseTranslationImport) {
      const importDecl = t.importDeclaration(
        [t.importSpecifier(t.identifier('useTranslation'), t.identifier('useTranslation'))],
        t.stringLiteral('react-i18next')
      );
      ast.program.body.unshift(importDecl);
    }

    // Inject const { t } = useTranslation(); into the main function
    // For simplicity, let's find the first JSX element and traverse up to its function parent
    let functionBody = null;
    traverse(ast, {
      JSXElement(pathNode) {
        if (!functionBody) {
          const fnParent = pathNode.getFunctionParent();
          if (fnParent && fnParent.node.body && fnParent.node.body.body) {
             functionBody = fnParent.node.body.body;
             // Check if it already has useTranslation
             const hasT = functionBody.some(stmt => 
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
               functionBody.unshift(useTransDecl);
             }
          }
        }
      }
    });

    const output = generate(ast, { retainLines: false }, code);
    fs.writeFileSync(filePath, output.code);
    console.log(`Transformed: ${file}`);
  }
}

// Write the updated EN dict
fs.writeFileSync(enDictPath, JSON.stringify(enDict, null, 2));

// Propagate keys to all other languages
const otherFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'en.json');
for (const locFile of otherFiles) {
  const p = path.join(localesDir, locFile);
  let dict = JSON.parse(fs.readFileSync(p, 'utf8'));
  
  // Merge keys (using English as fallback for now)
  for (const screen in enDict) {
    if (!dict[screen]) dict[screen] = {};
    for (const key in enDict[screen]) {
      if (!dict[screen][key]) {
        dict[screen][key] = enDict[screen][key]; // Fallback to EN
      }
    }
  }
  fs.writeFileSync(p, JSON.stringify(dict, null, 2));
}

console.log(`AST Transformation complete. Extracted ${totalKeysExtracted} keys.`);
