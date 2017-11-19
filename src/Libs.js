module.exports = $importAll([
    "core:Native.Data.Array:1.2.0",
    "core:Text.Parsing.Combinators:1.0.0",
    "core:Native.Data.Dict:1.0.0",
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
    FileSystem: $imports[3],
    Int: $imports[4],
    Lexer: $imports[5],
    Maybe: $imports[6],
    Path: $imports[7],
    Regex: $imports[8],
    Result: $imports[9],
    Stream: $imports[10],
    String: $imports[11]
}));