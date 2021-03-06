module.exports = $importAll([
    "../src/Libs",
    "core:Test.Unit.Assertion:2.0.1",
    "../index",
    "../src/LexerConfiguration",
    "../src/Parser",
    "../src/Transform",
    "../src/Translator",
    "../src/Validation",
    "core:Test.Unit:1.0.0"
]).then($imports => Object.assign({}, $imports[0], {
    Assertion: $imports[1],
    Index: $imports[2],
    LexerConfiguration: $imports[3],
    Parser: $imports[4],
    Transform: $imports[5],
    Translator: $imports[6],
    Validation: $imports[7],
    Unit: $imports[8]
}));
