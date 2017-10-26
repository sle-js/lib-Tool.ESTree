const Path = require("path");

const $Array = require("./Libs").Array;
const Assertion = require("./Libs").Assertion;
const FileSystem = require("../src/FileSystem");
const String = require("./Libs").String;
const Transform = require("../src/Transform");
const Translator = require("../src/Translator");
const Unit = require("./Libs").Unit;
const Validation = require("../src/Validation");

const LexerConfiguration = require("../src/LexerConfiguration");
const Parser = require("../src/Parser");


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
                    ? syntaxAssertion.equals(asString(Validation.duplicateIdentifiers(ast)).trim())(content.validation.join("\n").trim())
                    : syntaxAssertion;

            return content.js
                ? Translator
                    .translate(Transform.applyExtend(ast.declarations))
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
                content.ast
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
                    .then(directoryContents => Unit.Suite(suiteName)(directoryContents.filter(file =>file.endsWith(".txt")).map(file => loadSuite(file)(Path.resolve(fileSystemName, file))))));


module.exports =
    Unit.Suite("ESTree")([
        loadSuite("Parser")("./test/parser"),
        loadSuite("Syntax Errors")("./test/syntaxerrors"),
        loadSuite("Import")("./test/import"),
        loadSuite("Translation")("./test/translation"),
        loadSuite("Validation Errors")("./test/validationerrors")
    ]);