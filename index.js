const Errors = require("./src/Errors");
const FileSystem = require("./src/Libs").FileSystem;
const LexerConfiguration = require("./src/LexerConfiguration");
const Parser = require("./src/Parser");
const Path = require("path");
const Transform = require("./src/Transform");
const Translator = require("./src/Translator");
const Validation = require("./src/Validation");


const replaceExtension = newExtension => fileName => {
    const parseFileName =
        Path.parse(fileName);

    return Path.join(parseFileName.dir, parseFileName.name + newExtension);
};
assumptionEqual(replaceExtension(".js")("/home/bob/test.sample"), "/home/bob/test.js");
assumptionEqual(replaceExtension(".js")("./test.sample"), "test.js");


const target =
    replaceExtension(".js");


const loadSourceFile = sourceName =>
    FileSystem
        .readFile(sourceName)
        .catch(err => Promise.reject([Errors.SourceFileNotFound(sourceName)(err.code)]));


const writeTargetFile = targetName => content =>
    FileSystem
        .writeFile(targetName)(content)
        .catch(err => Promise.reject([Errors.UnableToWriteToTarget(targetName)(err.code)]));


const validate = ast => {
    const validationResult =
        Validation.validateAST(ast);

    return (validationResult.length === 0)
        ? Promise.resolve(ast)
        : Promise.reject(validationResult);
};


const translate = sourceName =>
    loadSourceFile(sourceName)
        .then(source =>
            Parser
                .program(LexerConfiguration.fromNamedString(sourceName)(source))
                .mapError(err => [err.result])
                .asPromise())
        .then(astResult =>
            Transform
                .applyImport(sourceName)(astResult.result)
                .catch(err => Promise.reject([err])))
        .then(validate)
        .then(ast => Promise.resolve(Transform.applyExtend(ast)))
        .then(ast => Translator.translate(ast).asPromise())
        .then(writeTargetFile(target(sourceName)));


module.exports = {
    target,
    translate
};