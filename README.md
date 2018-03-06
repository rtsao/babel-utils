# babel-utils

#### `getImportDeclarationVisitor(packageName, handler)`

Creates as visitor that calls a handler callback for each import declaration that matches the supplied package.


#### `visitNamedImports(importPath, moduleName, hander)`

Given an import path declaration node, calls a handler callback for each reference to the supplied named modules.

Suppose we want to transform usages of `foo` from `some-package`.

```js
import {foo as bar} from "some-package";

bar({});
```

```js
const visitor = getImportDeclarationVisitor(some-package", path => {
  visitNamedImports(path, "foo", paths => {
    paths.forEach(path => {
      // ...
    });
  });
});
```

#### `resolveToValue(path)`

Takes an identifier path and recursively traverses the scope (through variable declarations) until it finds a non-variable declaration.

```js
const foo = {foo: "foo"};
const bar = foo;
const baz = bar;

someFunction(baz);
```

Suppose we want to transform the argument of `someFunction`. `resolveToValue` will yield the object expression (assigned to foo) given the identifier node path passed to `someFunction`.
