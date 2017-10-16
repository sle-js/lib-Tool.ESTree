// type Location =
//      { source :: String, position :: Position }
//
// type Position =
//      { line :: Int, column :: Int }
//
// data Errors =
//      ConditionFailed { loc :: Location }
//    | ExpectedTokens { loc :: Location, found :: { id :: Int, symbol :: String, value :: String }, tokens :: Array { id :: Int, symbol :: String } }


const Position = line => column =>
    ({line, column});


const Location = source => position =>
    ({source, position});


function ErrorsType(content) {
    this.content = content;
}


const ConditionFailed = loc =>
    new ErrorsType({kind: "ConditionFailed", loc});


const ExpectedTokens = loc => found => tokens =>
    new ErrorsType({kind: "ExpectedToken", loc, found, tokens});


const orFailed = lexer =>
    new ErrorsType([2, lexer]);


module.exports = {
    Location,
    Position,
    ConditionFailed,
    ExpectedTokens,
    orFailed
};