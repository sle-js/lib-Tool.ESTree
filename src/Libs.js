module.exports = $importAll([
    "core:Native.Data.Array:1.2.0",
    "core:Text.Parsing.Combinators:1.0.0",
    "core:Native.Data.Dict:1.0.0",
    "use:./Errors.estree core:Tool.ESTree:1.0.0",
    "core:Native.System.IO.FileSystem:1.0.0",
    "core:Native.Data.Int:1.0.0",
    "core:Text.Parsing.Lexer:1.0.0",
    "core:Native.Data.Maybe:1.0.0",
    "path",
    "core:Native.Data.String.Regex:1.0.0",
    "core:Native.Data.Result:1.0.0",
    "core:Data.Collection.InfiniteStream:1.0.0",
    "core:Native.Data.String:1.0.0"
]).then($imports => ({
    Array: $imports[0],
    Combinators: $imports[1],
    Dict: $imports[2],
    Errors: $imports[3],
    FileSystem: $imports[4],
    Int: $imports[5],
    Lexer: $imports[6],
    Maybe: $imports[7],
    Path: $imports[8],
    Regex: $imports[9],
    Result: $imports[10],
    Stream: $imports[11],
    String: $imports[12]
}));