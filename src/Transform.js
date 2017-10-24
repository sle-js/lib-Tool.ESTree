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
        Array.map(d => isInterface(d) && d.name === extendInterfaceDeclaration.name ? extendInterface(d)(extendInterfaceDeclaration) : d);

    const foldFunction = acc => declaration =>
        isExtendInterface(declaration)
            ? applyExtendToDeclaration(declaration)(acc)
            : Array.append(declaration)(acc);

    return Array.foldl([])(foldFunction)(declarations);
};


const applyImport = programFileName => programAST => {
    const loadFile = fileName =>
        FileSystem.readFile(fileName);

    const parseString = fileName => content =>
        Parser.program(LexerConfiguration.fromNamedString(fileName)(content)).asPromise();

    if (programAST.importURL === null) {
        return Promise.resolve(programAST);
    } else {
        const programDirectoryName =
            Path.dirname(programFileName);

        const importFileName =
            Path.resolve(programDirectoryName, String.drop(5)(programAST.importURL.value));

        return loadFile(importFileName)
            .then(content => parseString(Path.relative(programDirectoryName, importFileName))(content))
            .then(astResult => applyImport(importFileName)(astResult.result))
            .then(ast => ESTreeAST.Program(programAST.loc, null, Array.concat(ast.declarations)(programAST.declarations)))
            .catch(err =>
                err instanceof Errors.Errors$
                    ? Promise.reject(err)
                    : Promise.reject(Errors.InvalidImport(programAST.importURL.loc)(programAST.importURL.value)(err.code)));
    }
};


module.exports = {
    applyExtend,
    applyImport
};