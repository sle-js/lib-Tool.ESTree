const Array = require("./Libs").Array;
const Errors = require("./Errors");
const Dict = require("./Libs").Dict;
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
            Dict.get(declaration.name.value)(map)
                .map(node => Array.append(declaration)(node))
                .withDefault([declaration]);

        return Dict.insert(declaration.name.value)(node)(map);
    };

    const f = map => declaration =>
        isInterface(declaration) || isEnum(declaration)
            ? addTo(declaration)(map)
            : map;

    return Array.foldl(Dict.empty)(f)(ast.declarations);
};


const duplicateIdentifiers = declarations =>
    Array.map(node => Errors.DuplicateIdentifier(Array.map(declaration => declaration.name.loc)(node[1]))(node[0]))(Array.filter(node => Array.length(node[1]) > 1)(Dict.entries(declarations)));


const extendUnknownInterfaces = ast => declarations =>
    ast.declarations
        .filter(d => isExtendInterface(d) && !Dict.member(d.name.value)(declarations))
        .map(d => Errors.ExtendUnknownInterface(d.name.loc)(d.name.value));


const baseReferencesUnknownDeclaration = ast => declarations =>
    Array.flatten(ast.declarations
        .filter(isInterface)
        .map(d => d.base))
        .filter(b => !Dict.member(b.value)(declarations))
        .map(b => Errors.BaseUnknownDeclaration(b.loc)(b.value));


// baseReferencesEnum :: ESTreeAST -> (Dict String -> Array Declaration) -> Array Errors
const baseReferencesEnum = ast => declarations =>
    Array.flatten(ast.declarations
        .filter(isInterface)
        .map(d => d.base))
        .filter(b => Dict.get(b.value)(declarations).map(Array.any(isEnum)).withDefault(false))
        .map(b => Errors.BaseReferencesEnum(b.loc)(b.value));


const duplicateInterfaceProperties = ast => {
    const f = acc => prop =>
        Dict.member(prop.name.value)(acc.props)
            ? {
                errors: Array.append(Errors.DuplicateProperty(Dict.get(prop.name.value)(acc.props).withDefault(undefined))(prop.name.loc)(prop.name.value))(acc.errors),
                props: acc.props
            }
            : {
                errors: acc.errors,
                props: Dict.insert(prop.name.value)(prop.name.loc)(acc.props)
            };

    const duplicateProperties =
        Array.foldl({errors: [], props: Dict.empty})(f);

    return Array.flatten(Transform.applyExtend(ast).declarations
        .filter(isInterface)
        .map(d => duplicateProperties(d.props).errors));
};


const detectCycles = ast => declarations => {
    const detectCycle = declaration => path => {
        const f = acc => b => {
            if (b.value === path[0].name.value) {
                return Array.append(Errors.InheritanceCycle(path.map(d => ({loc: d.name.loc, name: d.name.value}))))(acc);
            } else if (Array.any(d => d.name.value === b.value)(path)) {
                return acc;
            } else {
                return Dict.get(b.value)(declarations).map(d => {
                    const item = d[0];
                    if (isInterface(item)) {
                        const newPath = Array.append(item)(path);
                        const newCycle = detectCycle(item)(newPath);

                        return Array.concat(newCycle)(acc);
                    } else {
                        return acc;
                    }
                }).withDefault(acc);
            }
        };

        return Array.foldl([])(f)(declaration.base);
    };


    return Array.flatten(ast.declarations
        .filter(isInterface)
        .map(d => detectCycle(d)([d])));
};


const validateAST = ast => {
    const declarations =
        declarationMap(ast);

    return Array.flatten([
        duplicateIdentifiers(declarations),
        extendUnknownInterfaces(ast)(declarations),
        baseReferencesUnknownDeclaration(ast)(declarations),
        baseReferencesEnum(ast)(declarations),
        duplicateInterfaceProperties(ast),
        detectCycles(ast)(declarations)
    ]);
};


module.exports = {
    validateAST
};