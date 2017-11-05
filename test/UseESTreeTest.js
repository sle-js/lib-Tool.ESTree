const Array = require("./Libs").Array;
const Assertion = require("./Libs").Assertion;
const FileSystem = require("./../src/FileSystem");
const Path = require("path");
const Unit = require("./Libs").Unit;

const Use = require("./../index");


const toString = o =>
    JSON.stringify(o, null, 2);


const path = relativeName =>
    Path.join(Path.dirname(__filename), relativeName);


const thenTest = name => promise => thenAssertion =>
    promise
        .then(okay => Unit.Test(name)(thenAssertion(okay)))
        .catch(err => Unit.Test(name)(Assertion.fail("Error handler raised: " + err)));


const catchTest = name => promise => errorAssertion =>
    promise
        .then(_ => Unit.Test(name)(Assertion.fail(toString(_))))
        .catch(err => Unit.Test(name)(errorAssertion(err)))
        .catch(err => Unit.Test(name)(Assertion.fail("Error handler raised: " + err)));


assertKindIs = kind => errs =>
    Assertion.isTrue(Array.all(x => x.kind === kind)(errs));


module.exports = Unit.Suite("UseESTree")([
    catchTest("Source file does not exist")(
        Use.translate("./invalid_file_name_that_does_not_exist"))(
        assertKindIs("SourceFileNotFound")),

    catchTest("Source file contains a syntax error")(
        Use.translate(path("./useestree/001.input")))(
        assertKindIs("ExpectedTokens")),

    catchTest("Source file contains an invalid import")(
        Use.translate(path("./useestree/002.input")))(
        assertKindIs("InvalidImport")),

    catchTest("Source file contains a valid import but the imported file has a syntax error")(
        Use.translate(path("./useestree/003.input")))(
        assertKindIs("ExpectedTokens")),

    catchTest("Source file contain validation errors")(
        Use.translate(path("./useestree/004.input")))(
        assertKindIs("BaseUnknownDeclaration")),

    thenTest("Translate estree AST")(
        Use.translate(path("./useestree/005.estree"))
            .then(result => Promise.all([
                FileSystem.readFile(path("./useestree/005.js")),
                FileSystem.readFile(path("./useestree/005.expected.js"))
            ])))(
        result => Assertion.equals(result[0])(result[1]))
]);