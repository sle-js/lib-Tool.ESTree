// type Location =
//      { source :: String, position :: Position }
//
// type Position =
//      { line :: Int, column :: Int }
//
// data Errors =
//      ExpectedTokens { loc :: Location, found :: { id :: Int, symbol :: String, value :: String }, expected :: Array { id :: Int, symbol :: String } }


const Position = line => column =>
    ({line, column});


const Location = source => position =>
    ({source, position});


function ErrorsType(content) {
    this.content = content;
}


const ExpectedTokens = loc => found => expected =>
    new ErrorsType({kind: "ExpectedTokens", loc, found, expected});


module.exports = {
    Location,
    Position,
    ExpectedTokens
};