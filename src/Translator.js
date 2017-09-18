const Array = require("./Libs").Array;
const Maybe = require("./Libs").Maybe;
const Result = require("./Result");


const tab =
    "    ";


const flatten =
    Array.foldr([])(i => acc => Array.concat(i)(acc));


const isLiteralProperty = property =>
    property.type.kind === "Literal";


const removeAll = needles => a =>
    Array.filter(item => !Array.any(i => i.name === item.name)(needles))(a);


const translate = ast => {
    const interfaces =
        Array.filter(x => x.value.kind === "interface")(ast);

    const find = name =>
        Array.findMap(object => object.name === name ? Maybe.Just(object) : Maybe.Nothing)(ast);

    const allProperties = interfaceAST =>
        Array.concat(
            flatten(interfaceAST.value.base.map(find).map(c => c.map(allProperties).withDefault([]))))(
            interfaceAST.value.props);

    const nonLiteralProperties = interfaceAST => {
        const nonLiteralBaseProps =
            flatten(interfaceAST.value.base.map(find).map(c => c.map(nonLiteralProperties).withDefault([])));

        const literalProps =
            Array.filter(isLiteralProperty)(interfaceAST.value.props);

        const nonLiteralProps =
            Array.filter(prop => !(isLiteralProperty(prop)))(interfaceAST.value.props);

        return Array.concat(
            removeAll(literalProps)(nonLiteralBaseProps))(
            nonLiteralProps);
    };

    const constructor = constructorAST => {
        const properties =
            allProperties(constructorAST);

        const nonLP =
            nonLiteralProperties(constructorAST);

        const findLiteralProp = name =>
            Array.findMap(prop => prop.name === name && isLiteralProperty(prop) ? Maybe.Just(prop) : Maybe.Nothing)(constructorAST.value.props);

        const renderPropLiteralValue = prop =>
            typeof prop.type.value === "string"
                ? '"' + prop.type.value + '"'
                : prop.type.value;

        const renderPropLiteral = prop =>
            prop.name + ": " + (renderPropLiteralValue(prop));

        const renderProp = prop =>
            isLiteralProperty(prop)
                ? renderPropLiteral(prop)
                : findLiteralProp(prop.name).map(renderPropLiteralValue).withDefault(prop.name);

        const constructorBody =
            Array.length(constructorAST.value.base) === 0
                ? tab + "({" + properties.map(renderProp).join(", ") + "});"
                : tab + "Object.assign({}" + constructorAST.value.base.map(find).map(c => c.map(base => ",\n" + tab + tab + base.name + "(" + nonLiteralProperties(base).map(renderProp).join(", ") + ")").withDefault("")).join("") +

                (Array.length(constructorAST.value.props) > 0
                    ? ",\n" + tab + tab + "{" + constructorAST.value.props.map(renderProp).join(", ") + "}"
                    : "") +

                ");";

        return [
            "const " + constructorAST.name + " = (" + nonLP.map(p => p.name).join(", ") + ") =>",
            constructorBody
        ].join("\n");
    };

    const constructors =
        interfaces.map(constructor).map(c => c + "\n\n\n").join("");

    const moduleExports = [
        "module.exports = {",
        interfaces.map(i => tab + i.name).join(",\n"),
        "};"
    ];

    return Result.Okay(constructors + moduleExports.join("\n"));
};


module.exports = {
    translate
};