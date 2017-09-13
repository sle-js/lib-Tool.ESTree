const Array = require("./Libs").Array;
const Result = require("./Result");


const tab =
    "    ";


const flatten =
    Array.foldr([])(i => acc => Array.concat(i)(acc));


const translate = ast => {
    const interfaces =
        Array.filter(x => x.value.kind === "interface")(ast);

    const constructor = constructorAST => [
        "const " + constructorAST.name + " =" + (constructorAST.value.props.map(p => " " + p.name + " =>")).join(""),
        tab + "({" + (constructorAST.value.props.map(p => p.name)).join(", ") + "});"
    ].join("\n");

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