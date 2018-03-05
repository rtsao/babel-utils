# babel-utils

#### `createNamedModuleVisitor(namedExport, moduleName, handler)`

Creates as visitor that calls a handler callback for each reference to a named export. Useful for transforming usages of specific exports of specific packages. Gracefully handles export renaming.


Suppose we want to transform usages of `foo` from `some-package`.

```js
import {foo as bar} from "some-package";

bar({});
```

```js
const visitor = createNamedModuleVisitor("foo", "some-package", paths => {
  paths.forEach(path => {
    // ...
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
