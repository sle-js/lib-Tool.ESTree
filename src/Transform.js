module.exports = $importAll([
    "./Libs",
    "./Errors",
    "./ESTreeAST",
    "./LexerConfiguration",
    "./Parser"
]).then($imports => {
    const Path = $imports[0].Path;
    const Array = $imports[0].Array;
    const Errors = $imports[1];
    const ESTreeAST = $imports[2];
    const FileSystem = $imports[0].FileSystem;
    const LexerConfiguration = $imports[3];
    const Parser = $imports[4];
    const String = $imports[0].String;


    const isInterface = declaration =>
        declaration.kind === "Interface";


    const isExtendInterface = declaration =>
        declaration.kind === "ExtendInterface";


    const applyExtend = ast => {
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

        return ESTreeAST.Program(ast.loc, ast.importURL, Array.foldl([])(foldFunction)(ast.declarations));
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


    return {
        applyExtend,
        applyImport
    };
});
