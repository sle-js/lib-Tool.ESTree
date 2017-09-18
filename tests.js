const Unit = require("./test/Libs").Unit;


Unit.Suite("All")([
    require("./test/ParserTest"),
    require("./test/LexerTest")
])
    .then(Unit.showDetail)
    .then(Unit.showSummary)
    .then(Unit.setExitCodeOnFailures);
