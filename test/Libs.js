module.exports = $importAll([
    "../src/Libs"
]).then($imports => {
    return Object.assign({}, $imports[0], {
        Assertion: mrequire("core:Test.Unit.Assertion:2.0.1"),
        Index: require("../index"),
        LexerConfiguration: require("../src/LexerConfiguration"),
        Parser: require("../src/Parser"),
        Path: require("path"),
        Transform: require("../src/Transform"),
        Translator: require("../src/Translator"),
        Validation: require("../src/Validation"),
        Unit: mrequire("core:Test.Unit:1.0.0")
    });

});
