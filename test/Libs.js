module.exports = $importAll([
    "../src/Libs",
    "core:Test.Unit.Assertion:2.0.1",
    "../index",
    "../src/LexerConfiguration",
    "../src/Parser",
    "path",
    "../src/Transform",
    "../src/Translator",
    "../src/Validation",
    "core:Test.Unit:1.0.0"
]).then($imports => {
    return Object.assign({}, $imports[0], {
        Assertion: $imports[1],
        Index: $imports[2],
        LexerConfiguration: $imports[3],
        Parser: $imports[4],
        Path: $imports[5],
        Transform: $imports[6],
        Translator: $imports[7],
        Validation: $imports[8],
        Unit: $imports[9]
    });
});
