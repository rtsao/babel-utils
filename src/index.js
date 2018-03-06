// @flow

import * as t from "@babel/types";

// TODO: flatten recursion into while loop
// TODO: add alias callback
export function resolveToValue(path: any) {
  if (t.isIdentifier(path)) {
    const p = path.scope.bindings[path.node.name].path;
    if (t.isVariableDeclarator(p)) {
      return resolveToValue(p.get("init"));
    }
    return p;
  }
  return path;
}

export function getImportDeclarationVisitor(
  packageName: string | Array<string>,
  handler: (path: Object, packageName: string) => any,
) {
  return {
    ImportDeclaration(path: Object) {
      const sourceName = path.get("source").node.value;
      if (
        (Array.isArray(packageName) && !packageName.includes(sourceName)) ||
        sourceName !== packageName
      ) {
        return;
      }
      handler(path, packageName);
    },
  };
}

export function visitNamedSpecifiers(
  importPath: Object,
  moduleName: string | Array<string>,
  handler: (path: Array<Object>, moduleName: string) => any,
) {
  const matchesModuleName = maybeArrayMatcher(moduleName);
  importPath.get("specifiers").forEach(specifier => {
    if (t.isImportSpecifier(specifier)) {
      // import {moduleName} from 'packageName';

      const specifierName = specifier.get("imported").node.name;
      if (matchesModuleName(specifierName)) {
        handler(specifier, specifierName);
      }
    } else if (t.isImportNamespaceSpecifier(specifier)) {
      // import * as pkg from 'packageName';
      // TODO: Handle this case and/or log a warning because this may not be 100% robust
    } else if (t.isImportDefaultSpecifier(specifier)) {
      // import Default from 'packageName';

      if (matchesModuleName("default")) {
        handler(specifier, "default");
      }
    }
  });
}

export function visitSpecifierReferences(
  specifierPath: Object,
  handler: (paths: Array<Object>, moduleName: string) => any,
) {
  const localPath = specifierPath.get("local");
  const localName = localPath.node.name;
  const refPaths = localPath.scope.bindings[localName].referencePaths;
  return handler(refPaths);
}

export function visitNamedImports(
  importPath: Object,
  moduleName: string | Array<string>,
  handler: (refPaths: Array<Object>, moduleName: string) => any,
) {
  visitNamedSpecifiers(importPath, moduleName, specifier => {
    visitSpecifierReferences(specifier, paths => {
      handler(paths, moduleName);
    });
  });
}

function maybeArrayMatcher(maybeArray) {
  return Array.isArray(maybeArray)
    ? x => maybeArray.includes(x)
    : x => maybeArray === x;
}
