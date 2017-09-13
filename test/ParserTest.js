const Array = require("./Libs").Array;
const Assertion = require("./Libs").Assertion;
const FileSystem = require("../src/FileSystem");
const String = require("./Libs").String;
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


const processFile = content => assertion => {
    const ast =
        Parser.program(LexerConfiguration.fromString(content.src.join("\n")));

    const parseAST =
        content.ast
            ? assertion
                .isTrue(ast.isOkay())
                .equals(asString(ast.content[1].result).trim())(content.ast.join("\n").trim())
            : assertion
                .isTrue(ast.isOkay());

    if (content.js) {
        const translation = Translator.translate(ast.content[1].result);

        return parseAST
            .isTrue(translation.isOkay())
            .equals(translation.content[1].trim())(content.js.join("\n").trim());
    } else {
        return parseAST;
    }
};


const loadSuite = suiteName => fileSystemName =>
    FileSystem
        .lstat(fileSystemName)
        .then(lstat =>
            lstat.isFile()
                ? FileSystem
                    .readFile(fileSystemName)
                    .then(content => parseFile(content.split("\n")))
                    .then(content => Unit.Test(suiteName + ": " + content.name)(processFile(content)(Assertion)))
                    .catch(error => Unit.Test(suiteName)(Assertion.fail(error)))

                : FileSystem
                    .readdir(fileSystemName)
                    .then(directoryContents => Unit.Suite(suiteName)(directoryContents.map(file => loadSuite(file)(fileSystemName + "/" + file)))));


module.exports =
    Unit.Suite("ESTree")([
        loadSuite("Parser")("./test/parser"),
        loadSuite("Translation")("./test/translation")
    ]);