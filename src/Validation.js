const Array = require("./Libs").Array;
const Errors = require("./Errors");
const Map = require("./Map");


const isInterface = declaration =>
    declaration.kind === "Interface";


const isEnum = declaration =>
    declaration.kind === "Enum";


const isExtendInterface = declaration =>
    declaration.kind === "ExtendInterface";


const declarationMap = ast => {
    const addTo = declaration => map => {
        const node =
            Map.get(declaration.name.value)(map)
                .map(node => Array.append(declaration)(node))
                .withDefault([declaration]);

        return Map.insert(declaration.name.value)(node)(map);
    };

    const f = map => declaration =>
        isInterface(declaration) || isEnum(declaration)
            ? addTo(declaration)(map)
            : map;

    return Array.foldl(Map.empty)(f)(ast.declarations);
};


const duplicateIdentifiers = declarations => {
    return Array.map(node => Errors.DuplicateIdentifier(Array.map(declaration => declaration.name.loc)(node[1]))(node[0]))(Array.filter(node => Array.length(node[1]) > 1)(Map.entries(declarations)));
};


const extendUnknownInterfaces = ast => declarations =>
    ast.declarations
        .filter(d => isExtendInterface(d) && !Map.member(d.name.value)(declarations))
        .map(d => Errors.ExtendUnknownInterface(d.name.loc)(d.name.value));


const baseReferencesUnknownInterface = ast => declarations =>
    Array.flatten(ast.declarations
        .filter(d => isInterface(d))
        .map(d => d.base))
        .filter(b => !Map.member(b.value)(declarations))
        .map(b => Errors.BaseUnknownDeclaration(b.loc)(b.value));


const validateAST = ast => {
    const declarations =
        declarationMap(ast);

    return Array.flatten([
        duplicateIdentifiers(declarations),
        extendUnknownInterfaces(ast)(declarations),
        baseReferencesUnknownInterface(ast)(declarations)
    ]);
};


module.exports = {
    validateAST
};