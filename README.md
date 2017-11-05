# lib-Tool.ESTree

Once upon a time, an unsuspecting Mozilla engineer created an API in Firefox that exposed the SpiderMonkey engine's JavaScript parser as a JavaScript API. Said engineer documented the format it produced, and this format caught on as a lingua franca for tools that manipulate JavaScript source code.

This format has become useful in describing abstract syntax trees (AST).  This library:

- parses an estree file into an AST whilst reporting any syntax errors,
- supports importing of an estree file into a second estree file,
- reports validation error, and
- translates the estree AST into a JavaScript source file for inclusion into a project.

The grammar that this parser supports is derived from [https://github.com/estree/formal/blob/master/src/grammar.jison](https://github.com/estree/formal/blob/master/src/grammar.jison).

The following validation checks are supported:

- The import file exists,
- No duplicate declaration names,
- No extending of an unknown interface declaration,
- No inheriting from an unknown declaration,
- No attempt to inherit off of an enum declaration,
- No attempt is made to add a duplicate property name whilst extending a declaration, and
- No cyclic dependencies between inherited declarations.

