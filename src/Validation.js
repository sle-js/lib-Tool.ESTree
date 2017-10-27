const Array = require("./Libs").Array;
const Errors = require("./Errors");
const Map = require("./Map");


const isInterface = declaration =>
    declaration.kind === "Interface";


const isEnum = declaration =>
    declaration.kind === "Enum";


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


const duplicateIdentifiers = ast => {
    return Array.map(node => Errors.DuplicateIdentifier(Array.map(declaration => declaration.name.loc)(node[1]))(node[0]))(Array.filter(node => Array.length(node[1]) > 1)(Map.entries(declarationMap(ast))));
};


module.exports = {
    duplicateIdentifiers
};