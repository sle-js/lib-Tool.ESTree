const Array = require("./Libs").Array;
const Maybe = require("./Libs").Maybe;
const Result = require("./Result");


const tab =
    "    ";


const flatten =
    Array.foldr([])(i => acc => Array.concat(i)(acc));


const translate = ast => {
    const interfaces =
        Array.filter(x => x.value.kind === "interface")(ast);

    const find = name =>
        Array.findMap(object => object.name === name ? Maybe.Just(object) : Maybe.Nothing)(ast);

    const allProperties = interfaceAST =>
        Array.concat(
            flatten(interfaceAST.value.base.map(find).map(c => c.map(allProperties).withDefault([]))))(
            interfaceAST.value.props);

    const constructor = constructorAST => {
        const properties =
            allProperties(constructorAST);

        const isLiteralProperty = property =>
            property.type.kind === "literal";

        const constructorBody =
            Array.length(constructorAST.value.base) === 0
                ? tab + "({" + properties.map(property => isLiteralProperty(property) ? property.name + ": " + (typeof property.type.value === "string" ? '"' + property.type.value + '"' : property.type.value) : property.name).join(", ") + "});"
                : tab + "Object.assign({},\n" + constructorAST.value.base.map(find).map(c => c.map(base => tab + tab + base.name + "(" + base.value.props.map(p => p.name).join(", ") + ")").withDefault("")).join(",\n") + ");";

        return [
            "const " + constructorAST.name + " =" + Array.filter(p => !isLiteralProperty(p))(properties).map(p => p.name).map(name => " " + name + " =>").join(""),
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