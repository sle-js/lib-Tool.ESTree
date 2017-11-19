// type Location =
//      { source :: String, start :: Position, end :: Position }
//
// type Position =
//      { line :: Int, column :: Int }
//
// data Errors =
//      SourceFileNotFound { name :: String, reason :: String }
//    | UnableToWriteToTarget { name :: String, reason :: String }
//    | ExpectedTokens { loc :: Location, found :: { id :: Int, symbol :: String, value :: String }, expected :: Array { id :: Int, symbol :: String } }
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


const SourceFileNotFound = name =>
    ({package: "Tool.ESTree", kind: "SourceFileNotFound", name});


const UnableToWriteToTarget = name => reason =>
    ({package: "Tool.ESTree", kind: "UnableToWriteToTarget", name, reason});


const ExpectedTokens = loc => found => expected =>
    ({package: "Tool.ESTree", kind: "ExpectedTokens", loc, found, expected});


const InvalidImport = loc => url => code =>
    ({package: "Tool.ESTree", kind: "InvalidImport", loc, url, code});


const DuplicateIdentifier = locs => name =>
    ({package: "Tool.ESTree", kind: "DuplicateIdentifier", locs, name});


const ExtendUnknownInterface = loc => name =>
    ({package: "Tool.ESTree", kind: "ExtendUnknownInterface", loc, name});


const BaseUnknownDeclaration = loc => name =>
    ({package: "Tool.ESTree", kind: "BaseUnknownDeclaration", loc, name});


const BaseReferencesEnum = loc => name =>
    ({package: "Tool.ESTree", kind: "BaseReferencesEnum", loc, name});


const DuplicateProperty = originalLoc => duplicateLoc => name =>
    ({package: "Tool.ESTree", kind: "DuplicateProperty", originalLoc, duplicateLoc, name});


const InheritanceCycle = cycle =>
    ({package: "Tool.ESTree", kind: "InheritanceCycle", cycle});


module.exports = Promise.resolve({
    BaseReferencesEnum,
    BaseUnknownDeclaration,
    DuplicateIdentifier,
    DuplicateProperty,
    ExpectedTokens,
    ExtendUnknownInterface,
    InheritanceCycle,
    InvalidImport,
    Location,
    Position,
    SourceFileNotFound,
    UnableToWriteToTarget
});