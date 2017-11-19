module.exports = $import(
    "./test/Libs"
).then($imports => {
    const Unit = $imports.Unit;

    return Unit.Suite("All")([
        $import("./test/LexerTest"),
        require("./test/TestRunner"),
        require("./test/UseESTreeTest")
    ])
        .then(Unit.showDetail)
        .then(Unit.showSummary)
        .then(Unit.setExitCodeOnFailures);
}).catch(err => {
    console.error(err);
    process.exitCode = -1;
    return err;
});
