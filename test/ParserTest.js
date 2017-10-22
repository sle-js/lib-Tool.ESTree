const Array = require("./Libs").Array;
const Assertion = require("./Libs").Assertion;
const FileSystem = require("../src/FileSystem");
const String = require("./Libs").String;
const Transform = require("../src/Transform");
const Translator = require("../src/Translator");
const Unit = require("./Libs").Unit;

const LexerConfiguration = require("../src/LexerConfiguration");
const Parser = require("../src/Parser");


const asString = o =>
    JSON.stringify(o, null, 2);


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

            result[result.current] = Array.append(item)(result[result.current]);

            return result;
        }
    };

    return Array.foldl({
        current: "src",
        name: String.trim(String.drop(2)(content[0])),
        src: []
    })(newLine)(Array.drop(1)(content));
};


const processFile = name => content => assertion => {
    return Parser.program(LexerConfiguration.fromNamedString(name)(content.src.join("\n"))).asPromise()
        .then(ast => {
            const astAssertion =
                content.ast
                    ? assertion.equals(asString(ast.result).trim())(content.ast.join("\n").trim())
                    : assertion.isTrue(true);

            const syntaxAssertion =
                content.syntax
                    ? astAssertion.fail("Expected a parsing error")
                    : astAssertion;

            return content.js
                ? Translator
                    .translate(Transform.applyExtend(ast.result.declarations))
                    .reduce(
                        okay =>
                            syntaxAssertion.equals(okay.trim())(content.js.join("\n").trim()))(
                        err =>
                            syntaxAssertion.fail(err))
                : syntaxAssertion;
        })
        .catch(err => {
            const errContent =
                err.result.content;

            const astAssertion =
                content.ast
                    ? assertion.fail(asString(errContent))
                    : assertion.isTrue(true);

            const syntaxAssertion =
                content.syntax
                    ? astAssertion.equals(asString(errContent).trim())(content.syntax.join("\n").trim())
                    : astAssertion;

            return content.js
                ? syntaxAssertion.fail(JSON.stringify(errContent, null, 2))
                : syntaxAssertion;
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
                        Promise.all([content, processFile(suiteName)(content)(Assertion)]))
                    .then(result =>
                        Unit.Test(suiteName + ": " + result[0].name)(result[1]))
                    .catch(error => Unit.Test(suiteName)(Assertion.fail(JSON.stringify(error))))

                : FileSystem
                    .readdir(fileSystemName)
                    .then(directoryContents => Unit.Suite(suiteName)(directoryContents.map(file => loadSuite(file)(fileSystemName + "/" + file)))));


module.exports =
    Unit.Suite("ESTree")([
        loadSuite("Parser")("./test/parser"),
        loadSuite("Syntax Errors")("./test/syntaxerrors"),
        loadSuite("Translation")("./test/translation")
    ]);