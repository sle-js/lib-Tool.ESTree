module.exports = $import(
    "./Libs"
).then($imports => {
    const $Array = $imports.Array;
    const Assertion = $imports.Assertion;
    const FileSystem = $imports.FileSystem;
    const LexerConfiguration = $imports.LexerConfiguration;
    const Parser = $imports.Parser;
    const Path = $imports.Path;
    const String = $imports.String;
    const Transform = $imports.Transform;
    const Translator = $imports.Translator;
    const Unit = $imports.Unit;
    const Validation = $imports.Validation;


    const asString = o =>
        o.kind || Array.isArray(o)
            ? JSON.stringify(o, null, 2)
            : o;


    const parseFile = content => {
        const newLine = acc => item => {
            if (String.startsWith("--")(item)) {
                const name =
                    String.trim(String.drop(2)(item));

                const result =
                    Object.assign({}, acc, {current: name});

                result[name] = [];

                return result;
            } else {
                const result =
                    Object.assign({}, acc);

                result[result.current] = $Array.append(item)(result[result.current]);

                return result;
            }
        };

        return $Array.foldl({
            current: "src",
            name: String.trim(String.drop(2)(content[0])),
            src: []
        })(newLine)($Array.drop(1)(content));
    };


    const processFile = fileName => name => content => {
        return Parser.program(LexerConfiguration.fromNamedString(name)(content.src.join("\n"))).asPromise()
            .then(astResult => Transform.applyImport(fileName)(astResult.result))
            .then(ast => {
                const astAssertion =
                    content.ast
                        ? Assertion.equals(asString(ast).trim())(content.ast.join("\n").trim())
                        : Assertion.AllGood;

                const syntaxAssertion =
                    content.syntax
                        ? astAssertion.fail("Expected a parsing error")
                        : astAssertion;

                const validationAssertion =
                    content.validation
                        ? syntaxAssertion.equals(asString(Validation.validateAST(ast)).trim())(content.validation.join("\n").trim())
                        : syntaxAssertion;

                return content.js
                    ? Translator
                        .translate(Transform.applyExtend(ast))
                        .reduce(
                            okay =>
                                validationAssertion.equals(okay.trim())(content.js.join("\n").trim()))(
                            err =>
                                validationAssertion.fail(err))
                    : validationAssertion;
            })
            .catch(err => {
                const errContent =
                    err.result ? err.result : err.content ? err.content : err;

                const astAssertion =
                    content.ast
                        ? Assertion.fail(asString(errContent))
                        : Assertion.AllGood;

                const syntaxAssertion =
                    content.syntax
                        ? astAssertion.equals(asString(errContent).trim())(content.syntax.join("\n").trim())
                        : astAssertion;

                const validationAssertion =
                    content.validation
                        ? syntaxAssertion.fail(asString(errContent))
                        : syntaxAssertion;

                return content.js
                    ? validationAssertion.fail(asString(errContent))
                    : validationAssertion;
            });
    };


    const loadSuite = suiteName => fileSystemName =>
        FileSystem
            .lstat(fileSystemName)
            .then(lstat =>
                lstat.isFile()
                    ? FileSystem
                        .readFile(fileSystemName)
                        .then(content => parseFile(content.split("\n")))
                        .then(content =>
                            Promise.all([content, processFile(fileSystemName)(suiteName)(content)]))
                        .then(result =>
                            Unit.Test(suiteName + ": " + result[0].name)(result[1]))
                        .catch(error => Unit.Test(suiteName)(Assertion.fail(JSON.stringify(error))))

                    : FileSystem
                        .readdir(fileSystemName)
                        .then(directoryContents => Unit.Suite(suiteName)(directoryContents.filter(file => file.endsWith(".txt")).map(file => loadSuite(file)(Path.resolve(fileSystemName, file))))));


    const dirname = name =>
        Path.resolve(__dirname, name);


    return Unit.Suite("ESTree")([
        loadSuite("Parser")(dirname("./parser")),
        loadSuite("Syntax Errors")(dirname("./syntaxerrors")),
        loadSuite("Import")(dirname("./import")),
        loadSuite("Translation")(dirname("./translation")),
        loadSuite("Validation Errors")(dirname("./validationerrors"))
    ]);
});
