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

export function createNamedModuleVisitor(
  moduleName: string | Array<string>,
  packageName: string | Array<string>,
  refsHandler: (
    context: Object,
    refs: Array<Object>,
    specifierName: string,
  ) => any,
) {
  const compareToModuleName = Array.isArray(moduleName)
    ? s => moduleName.includes(s)
    : s => s === moduleName;
  return {
    /**
     * Handle ES imports
     *
     * import {moduleName} from 'packageName';
     */
    ImportDeclaration(path: Object, state: Object) {
      const sourceName = path.get("source").node.value;
      if (
        (Array.isArray(packageName) &&
          packageName.indexOf(sourceName) === -1) ||
        (typeof packageName === "string" && sourceName !== packageName)
      ) {
        return;
      }
      state.importedPackageName = sourceName;
      path.get("specifiers").forEach(specifier => {
        const localPath = specifier.get("local");
        const localName = localPath.node.name;
        const refPaths = localPath.scope.bindings[localName].referencePaths;
        if (t.isImportSpecifier(specifier)) {
          // import {moduleName} from 'packageName';
          const specifierName = specifier.get("imported").node.name;
          if (compareToModuleName(specifierName)) {
            refsHandler(state, refPaths, specifierName);
          }
        } else if (t.isImportNamespaceSpecifier(specifier)) {
          // import * as pkg from 'packageName';
          // TODO: Handle this case and/or log a warning because this may not be 100% robust
        } else if (t.isImportDefaultSpecifier(specifier)) {
          if (compareToModuleName("default")) {
            refsHandler(state, refPaths, "default");
          }
        }
      });
    },
  };
}
