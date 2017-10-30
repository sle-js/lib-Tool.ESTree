// type Location =
//      { source :: String, start :: Position, end :: Position }
//
// type Position =
//      { line :: Int, column :: Int }
//
// data Errors =
//      ExpectedTokens { loc :: Location, found :: { id :: Int, symbol :: String, value :: String }, expected :: Array { id :: Int, symbol :: String } }
//    | InvalidImport { loc :: Location, url :: String, reason :: String }
//    | DuplicateIdentifier { locs :: Array Location, name :: String }
//    | ExtendUnknownInterface { loc :: Location, name :: String }
//    | BaseUnknownDeclaration { loc :: Location, name :: String }
//    | BaseReferencesEnum { loc :: Location, name :: String }
//    | DuplicateProperty { originalLoc :: Location, duplicateLoc :: Location, name :: String }
//    | InheritanceCycle { cycle :: Array { loc :: Location, name :: String } }


const Position = line => column =>
    ({line, column});


const Location = source => position =>
    ({source, position});


const ExpectedTokens = loc => found => expected =>
    ({kind: "ExpectedTokens", loc, found, expected});


const InvalidImport = loc => url => code =>
    ({kind: "InvalidImport", loc, url, code});


const DuplicateIdentifier = locs => name =>
    ({kind: "DuplicateIdentifier", locs, name});


const ExtendUnknownInterface = loc => name =>
    ({kind: "ExtendUnknownInterface", loc, name});


const BaseUnknownDeclaration = loc => name =>
    ({kind: "BaseUnknownDeclaration", loc, name});


const BaseReferencesEnum = loc => name =>
    ({kind: "BaseReferencesEnum", loc, name});


const DuplicateProperty = originalLoc => duplicateLoc => name =>
    ({kind: "DuplicateProperty", originalLoc, duplicateLoc, name});


const InheritanceCycle = cycle =>
    ({kind: "InheritanceCycle", cycle});


module.exports = {
    BaseReferencesEnum,
    BaseUnknownDeclaration,
    DuplicateIdentifier,
    DuplicateProperty,
    ExpectedTokens,
    ExtendUnknownInterface,
    InheritanceCycle,
    InvalidImport,
    Location,
    Position
};