const Array = require("./Libs").Array;
const Errors = require("./Errors");
const Map = require("./Map");
const Transform = require("./Transform");


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


const duplicateIdentifiers = declarations =>
    Array.map(node => Errors.DuplicateIdentifier(Array.map(declaration => declaration.name.loc)(node[1]))(node[0]))(Array.filter(node => Array.length(node[1]) > 1)(Map.entries(declarations)));


const extendUnknownInterfaces = ast => declarations =>
    ast.declarations
        .filter(d => isExtendInterface(d) && !Map.member(d.name.value)(declarations))
        .map(d => Errors.ExtendUnknownInterface(d.name.loc)(d.name.value));


const baseReferencesUnknownDeclaration = ast => declarations =>
    Array.flatten(ast.declarations
        .filter(isInterface)
        .map(d => d.base))
        .filter(b => !Map.member(b.value)(declarations))
        .map(b => Errors.BaseUnknownDeclaration(b.loc)(b.value));


// baseReferencesEnum :: ESTreeAST -> (Map String -> Array Declaration) -> Array Errors
const baseReferencesEnum = ast => declarations =>
    Array.flatten(ast.declarations
        .filter(isInterface)
        .map(d => d.base))
        .filter(b => Map.get(b.value)(declarations).map(Array.any(isEnum)).withDefault(false))
        .map(b => Errors.BaseReferencesEnum(b.loc)(b.value));


const duplicateInterfaceProperties = ast => {
    const f = acc => prop =>
        Map.member(prop.name.value)(acc.props)
            ? {
                errors: Array.append(Errors.DuplicateProperty(Map.get(prop.name.value)(acc.props).withDefault(undefined))(prop.name.loc)(prop.name.value))(acc.errors),
                props: acc.props
            }
            : {
                errors: acc.errors,
                props: Map.insert(prop.name.value)(prop.name.loc)(acc.props)
            };

    const duplicateProperties =
        Array.foldl({errors: [], props: Map.empty})(f);

    return Array.flatten(Transform.applyExtend(ast.declarations)
        .filter(isInterface)
        .map(d => duplicateProperties(d.props).errors));
};


const validateAST = ast => {
    const declarations =
        declarationMap(ast);

    return Array.flatten([
        duplicateIdentifiers(declarations),
        extendUnknownInterfaces(ast)(declarations),
        baseReferencesUnknownDeclaration(ast)(declarations),
        baseReferencesEnum(ast)(declarations),
        duplicateInterfaceProperties(ast)
    ]);
};


module.exports = {
    validateAST
};