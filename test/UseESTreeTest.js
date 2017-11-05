const Assertion = require("./Libs").Assertion;
const Errors = require("./../src/Errors");
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


module.exports = Unit.Suite("UseESTree")([
    catchTest("Source file does not exist")(
        Use.translate("./invalid_file_name_that_does_not_exist"))(
        err => Assertion.equals(toString(err))(toString(Errors.SourceFileNotFound("./invalid_file_name_that_does_not_exist")))),

    catchTest("Source file contains a syntax error")(
        Use.translate(path("./useestree/001.input")))(
        err =>
            Assertion.equals(err.kind)("ExpectedTokens"))
]);