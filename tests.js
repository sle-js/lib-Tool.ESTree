const Unit = require("./test/Libs").Unit;


Unit.Suite("All")([
    require("./test/LexerTest"),
    require("./test/ParserTest"),
    require("./test/UseESTreeTest")
])
    .then(Unit.showDetail)
    .then(Unit.showSummary)
    .then(Unit.setExitCodeOnFailures);
