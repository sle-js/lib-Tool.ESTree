const Array = require("./Libs").Array;
const Maybe = require("./Libs").Maybe;
const Result = require("./Libs").Result;


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
    Array.filter(item => !Array.any(i => i.name.value === item.name.value)(needles))(a);


const translate = ast => {
    const enumAndInterfaces =
        Array.filter(x => isInterface(x) || isEnum(x))(ast.declarations);

    const find = name =>
        Array.findMap(object => object.name.value === name.value ? Maybe.Just(object) : Maybe.Nothing)(ast.declarations);

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

    const renderValue = value =>
        typeof value === "string"
            ? '"' + value + '"'
            : value;

    const interfaceConstructor = interfaceAST => {
        const properties =
            allProperties(interfaceAST);

        const nonLP =
            nonLiteralProperties(interfaceAST);

        const findLiteralProp = name =>
            Array.findMap(prop => prop.name.value === name.value && isLiteralProperty(prop) ? Maybe.Just(prop) : Maybe.Nothing)(interfaceAST.props);

        const renderPropLiteralValue = prop =>
            renderValue(prop.value.value);

        const renderPropLiteral = prop =>
            prop.name.value + ": " + (renderPropLiteralValue(prop));

        const renderProp = prop =>
            isLiteralProperty(prop)
                ? renderPropLiteral(prop)
                : findLiteralProp(prop.name).map(renderPropLiteralValue).withDefault(prop.name.value);

        const constructorBody =
            Array.length(interfaceAST.base) === 0
                ? tab + "({" + properties.map(renderProp).join(", ") + "});"
                : tab + "Object.assign({}" + interfaceAST.base.map(find).map(c => c.map(base => ",\n" + tab + tab + base.name.value + "(" + nonLiteralProperties(base).map(renderProp).join(", ") + ")").withDefault("")).join("") +

                (Array.length(interfaceAST.props) > 0
                    ? ",\n" + tab + tab + "{" + interfaceAST.props.map(renderProp).join(", ") + "}"
                    : "") +

                ");";

        return [
            "const " + interfaceAST.name.value + " = (" + nonLP.map(p => p.name.value).join(", ") + ") =>",
            constructorBody
        ].join("\n");
    };


    const enumConstructor = enumAST => {
        return [
            "const " + enumAST.name.value + " = (value) =>",
            tab + "(" + enumAST.values.map(i => "value === " + renderValue(i.value)).join("\n" + tab + "|| ") + ")",
            tab + tab + "? value",
            tab + tab + ": undefined;"
        ].join("\n");
    };


    const constructors =
        enumAndInterfaces.map(d =>  isInterface(d) ? interfaceConstructor(d) : enumConstructor(d)).map(c => c + "\n\n\n").join("");


    const moduleExports = [
        "module.exports = {",
        enumAndInterfaces.map(i => tab + i.name.value).join(",\n"),
        "};"
    ];

    return Result.Okay(constructors + moduleExports.join("\n"));
};


module.exports = {
    translate
};