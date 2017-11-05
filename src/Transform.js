const Path = require("path");

const Array = require("./Libs").Array;
const Errors = require("./Errors");
const ESTreeAST = require("./ESTreeAST");
const FileSystem = require("./FileSystem");
const LexerConfiguration = require("./LexerConfiguration");
const Parser = require("./Parser");
const String = require("./Libs").String;


const isInterface = declaration =>
    declaration.kind === "Interface";


const isExtendInterface = declaration =>
    declaration.kind === "ExtendInterface";


const applyExtend = declarations => {
    const extendInterface = interfaceDeclaration => extendInterfaceDeclaration =>
        ESTreeAST.Interface(
            interfaceDeclaration.loc,
            interfaceDeclaration.name,
            Array.concat(interfaceDeclaration.props)(extendInterfaceDeclaration.props),
            interfaceDeclaration.base);

    const applyExtendToDeclaration = extendInterfaceDeclaration =>
        Array.map(d => isInterface(d) && d.name.value === extendInterfaceDeclaration.name.value ? extendInterface(d)(extendInterfaceDeclaration) : d);

    const foldFunction = acc => declaration =>
        isExtendInterface(declaration)
            ? applyExtendToDeclaration(declaration)(acc)
            : Array.append(declaration)(acc);

    return Array.foldl([])(foldFunction)(declarations);
};


const applyImport = programFileName => programAST => {
    if (programAST.importURL === null) {
        return Promise.resolve(programAST);
    } else {
        const loadImportedFile = fileName =>
            FileSystem.readFile(fileName)
                .catch(err => Promise.reject(Errors.InvalidImport(programAST.importURL.loc)(programAST.importURL.value)(err.code)));

        const parseString = fileName => content =>
            Parser
                .program(LexerConfiguration.fromNamedString(fileName)(content))
                .map(astResult => astResult.result)
                .mapError(errResult => errResult.result)
                .asPromise();

        const programDirectoryName =
            Path.dirname(programFileName);

        const importFileName =
            Path.resolve(programDirectoryName, String.drop(5)(programAST.importURL.value));

        const mergeImport = ast =>
            ESTreeAST.Program(programAST.loc, null, Array.concat(ast.declarations)(programAST.declarations));

        return loadImportedFile(importFileName)
            .then(parseString(Path.relative(programDirectoryName, importFileName)))
            .then(applyImport(importFileName))
            .then(mergeImport);
    }
};


module.exports = {
    applyExtend,
    applyImport
};