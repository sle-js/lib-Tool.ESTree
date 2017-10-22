const Array = require("./Libs").Array;
const ESTreeAST = require("./ESTreeAST");


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


module.exports = {
    applyExtend
};