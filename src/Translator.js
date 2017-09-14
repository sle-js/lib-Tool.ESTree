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

    const constructorParameters = constructorAST =>
        Array.concat(
            flatten(
                constructorAST.value.base.map(find).map(c => c.map(constructorParameters).withDefault([]))))(
            constructorAST.value.props.map(p => p.name));

    const constructor = constructorAST => {
        const constructorBody =
            Array.length(constructorAST.value.base) === 0
                ? tab + "({" + constructorParameters(constructorAST).join(", ") + "});"
                : tab + "Object.assign({},\n" + constructorAST.value.base.map(find).map(c => c.map(base => tab + tab + base.name + "(" + base.value.props.map(p => p.name).join(", ") + ")").withDefault("")).join(",\n") + ");";

        return [
            "const " + constructorAST.name + " =" + constructorParameters(constructorAST).map(name => " " + name + " =>").join(""),
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