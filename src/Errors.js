// type Location =
//      { source :: String, position :: Position }
//
// type Position =
//      { line :: Int, column :: Int }
//
// data Errors =
//      ExpectedTokens { loc :: Location, found :: { id :: Int, symbol :: String, value :: String }, expected :: Array { id :: Int, symbol :: String } }
//    | InvalidImport { loc :: Location, url :: String, reason :: String }


const Position = line => column =>
    ({line, column});


const Location = source => position =>
    ({source, position});


function Errors$(content) {
    this.content = content;
}


const ExpectedTokens = loc => found => expected =>
    new Errors$({kind: "ExpectedTokens", loc, found, expected});


const InvalidImport = loc => url => code =>
    new Errors$({kind: "InvalidImport", loc, url, code});


module.exports = {
    Errors$,
    Location,
    Position,
    ExpectedTokens,
    InvalidImport
};