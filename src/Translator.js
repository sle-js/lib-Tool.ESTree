const Array = require("./Libs").Array;
const Maybe = require("./Libs").Maybe;
const Result = require("./Result");


const tab =
    "    ";


const flatten =
    Array.foldr([])(i => acc => Array.concat(i)(acc));


const isLiteralProperty = property =>
    property.value.kind === "Literal";


const isInterface = declaration =>
    declaration.kind === "Interface";


const isEnum = declaration =>
    declaration.kind === "Enum";


const removeAll = needles => a =>
    Array.filter(item => !Array.any(i => i.name === item.name)(needles))(a);


const translate = ast => {
    const enumAndInterfaces =
        Array.filter(x => isInterface(x) || isEnum(x))(ast);

    const find = name =>
        Array.findMap(object => object.name === name ? Maybe.Just(object) : Maybe.Nothing)(ast);

    const allProperties = interfaceAST =>
        Array.concat(
            flatten(interfaceAST.base.map(find).map(c => c.map(allProperties).withDefault([]))))(
            interfaceAST.props);

    const nonLiteralProperties = interfaceAST => {
        const nonLiteralBaseProps =
            flatten(interfaceAST.base.map(find).map(c => c.map(nonLiteralProperties).withDefault([])));

        const literalProps =
            Array.filter(isLiteralProperty)(interfaceAST.props);

        const nonLiteralProps =
            Array.filter(prop => !(isLiteralProperty(prop)))(interfaceAST.props);

        return Array.concat(
            removeAll(literalProps)(nonLiteralBaseProps))(
            nonLiteralProps);
    };

    const interfaceConstructor = interfaceAST => {
        const properties =
            allProperties(interfaceAST);

        const nonLP =
            nonLiteralProperties(interfaceAST);

        const findLiteralProp = name =>
            Array.findMap(prop => prop.name === name && isLiteralProperty(prop) ? Maybe.Just(prop) : Maybe.Nothing)(interfaceAST.props);

        const renderPropLiteralValue = prop =>
            typeof prop.value.value === "string"
                ? '"' + prop.value.value + '"'
                : prop.value.value;

        const renderPropLiteral = prop =>
            prop.name + ": " + (renderPropLiteralValue(prop));

        const renderProp = prop =>
            isLiteralProperty(prop)
                ? renderPropLiteral(prop)
                : findLiteralProp(prop.name).map(renderPropLiteralValue).withDefault(prop.name);

        const constructorBody =
            Array.length(interfaceAST.base) === 0
                ? tab + "({" + properties.map(renderProp).join(", ") + "});"
                : tab + "Object.assign({}" + interfaceAST.base.map(find).map(c => c.map(base => ",\n" + tab + tab + base.name + "(" + nonLiteralProperties(base).map(renderProp).join(", ") + ")").withDefault("")).join("") +

                (Array.length(interfaceAST.props) > 0
                    ? ",\n" + tab + tab + "{" + interfaceAST.props.map(renderProp).join(", ") + "}"
                    : "") +

                ");";

        return [
            "const " + interfaceAST.name + " = (" + nonLP.map(p => p.name).join(", ") + ") =>",
            constructorBody
        ].join("\n");
    };

    const constructors =
        enumAndInterfaces.filter(isInterface).map(interfaceConstructor).map(c => c + "\n\n\n").join("");

    const moduleExports = [
        "module.exports = {",
        enumAndInterfaces.map(i => tab + i.name).join(",\n"),
        "};"
    ];

    return Result.Okay(constructors + moduleExports.join("\n"));
};


module.exports = {
    translate
};