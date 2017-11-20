module.exports = $importAll([
    "./src/Libs",
    "./src/LexerConfiguration",
    "./src/Parser",
    "path",
    "./src/Transform",
    "./src/Translator",
    "./src/Validation"
]).then($imports => {
    const Errors = $imports[0].Errors;
    const FileSystem = $imports[0].FileSystem;
    const LexerConfiguration = $imports[1];
    const Parser = $imports[2];
    const Path = $imports[3];
    const Transform = $imports[4];
    const Translator = $imports[5];
    const Validation = $imports[6];


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


    return {
        target,
        translate
    };
});
