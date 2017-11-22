const Position = (line, column) =>
    ({line, column});


const Location = (source, position) =>
    ({source, position});


const Errors = (kind) =>
    ({package: "Tool.ESTree", kind});


const SourceFileNotFound = (name, code) =>
    Object.assign({},
        Errors("SourceFileNotFound"),
        {kind: "SourceFileNotFound", name, code});


const UnableToWriteToTarget = (name, code) =>
    Object.assign({},
        Errors("UnableToWriteToTarget"),
        {kind: "UnableToWriteToTarget", name, code});


const ExpectedTokens = (loc, found, expected) =>
    Object.assign({},
        Errors("ExpectedTokens"),
        {kind: "ExpectedTokens", loc, found, expected});


const InvalidImport = (loc, url, code) =>
    Object.assign({},
        Errors("InvalidImport"),
        {kind: "InvalidImport", loc, url, code});


const DuplicateIdentifier = (locs, name) =>
    Object.assign({},
        Errors("DuplicateIdentifier"),
        {kind: "DuplicateIdentifier", locs, name});


const ExtendUnknownInterface = (loc, name) =>
    Object.assign({},
        Errors("ExtendUnknownInterface"),
        {kind: "ExtendUnknownInterface", loc, name});


const BaseUnknownDeclaration = (loc, name) =>
    Object.assign({},
        Errors("BaseUnknownDeclaration"),
        {kind: "BaseUnknownDeclaration", loc, name});


const BaseReferencesEnum = (loc, name) =>
    Object.assign({},
        Errors("BaseReferencesEnum"),
        {kind: "BaseReferencesEnum", loc, name});


const DuplicateProperty = (originalLoc, duplicateLoc, name) =>
    Object.assign({},
        Errors("DuplicateProperty"),
        {kind: "DuplicateProperty", originalLoc, duplicateLoc, name});


const InheritanceCycle = (cycle) =>
    Object.assign({},
        Errors("InheritanceCycle"),
        {kind: "InheritanceCycle", cycle});


module.exports = {
    Position,
    Location,
    Errors,
    SourceFileNotFound,
    UnableToWriteToTarget,
    ExpectedTokens,
    InvalidImport,
    DuplicateIdentifier,
    ExtendUnknownInterface,
    BaseUnknownDeclaration,
    BaseReferencesEnum,
    DuplicateProperty,
    InheritanceCycle
};