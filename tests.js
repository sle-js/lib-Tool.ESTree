const Unit = require("./test/Libs").Unit;


Unit.Suite("All")([
    require("./test/ParserTest")
])
    .then(Unit.showErrors)
    .then(Unit.showSummary)
    .then(Unit.setExitCodeOnFailures);
