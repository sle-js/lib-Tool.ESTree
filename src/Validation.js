const Array = require("./Libs").Array;
const Errors = require("./Errors");


const isInterface = declaration =>
    declaration.kind === "Interface";


const isEnum = declaration =>
    declaration.kind === "Enum";


const duplicateIdentifiers = ast => {
    const addLocation = node => location =>
        Errors.DuplicateIdentifier(Array.append(location)(node.locs))(node.name);

    const addTo = map => declaration => {
        const node =
            map.get(declaration.name)
                ? addLocation(map.get(declaration.name))(declaration.loc)
                : Errors.DuplicateIdentifier([declaration.loc])(declaration.name);

        map.set(declaration.name, node);

        return map;
    };

    const f = map => declaration =>
        (isInterface(declaration) || isEnum(declaration))
            ? addTo(map)(declaration)
            : map;

    const identifiers =
        Array.foldl(new Map())(f)(ast.declarations);

    return Array.filter(node => Array.length(node.locs) > 1)([... identifiers.values()]);
};


module.exports = {
    duplicateIdentifiers
};