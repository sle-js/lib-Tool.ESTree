const Array = require("./Libs").Array;
const C = require("./ParseCombinators");
const Errors = require("./Errors");
const ESTreeAST = require("./ESTreeAST");
const Tokens = require("./Tokens");


function program(lexer) {
    return C.andMap([
        C.many(def),
        C.token(Errors)(Tokens.eof)
    ])(a => a[0])(lexer);
}


function def(lexer) {
    return C.or(Errors)([
        C.andMap([
            C.token(Errors)(Tokens.INTERFACE),
            C.token(Errors)(Tokens.NAME),
            object
        ])(a => ESTreeAST.Interface(stretchSourceLocation(locationAt(a[0]))(a[2].loc), valueOf(a[1]), a[2].properties, [])),
        C.andMap([
            C.token(Errors)(Tokens.EXTEND),
            C.token(Errors)(Tokens.INTERFACE),
            C.token(Errors)(Tokens.NAME),
            object
        ])(a => ESTreeAST.ExtendInterface(stretchSourceLocation(locationAt(a[0]))(a[3].loc), valueOf(a[2]), a[3].properties)),
        C.andMap([
            C.token(Errors)(Tokens.INTERFACE),
            C.token(Errors)(Tokens.NAME),
            C.token(Errors)(Tokens.LESS_COLON),
            C.chainl1(token(Tokens.NAME))(C.token(Errors)(Tokens.COMMA)),
            object
        ])(a => ESTreeAST.Interface(stretchSourceLocation(locationAt(a[0]))(a[4].loc), valueOf(a[1]), a[4].properties, a[3])),
        C.andMap([
            C.token(Errors)(Tokens.ENUM),
            C.token(Errors)(Tokens.NAME),
            C.token(Errors)(Tokens.LCURLY),
            C.chainl1(literal)(C.token(Errors)(Tokens.BAR)),
            C.token(Errors)(Tokens.RCURLY)
        ])(a => ESTreeAST.Enum(location(a[0])(a[4]), valueOf(a[1]), a[3]))
    ])(lexer);
}


function object(lexer) {
    return C.andMap([
        C.token(Errors)(Tokens.LCURLY),
        C.many(prop),
        C.token(Errors)(Tokens.RCURLY)
    ])(a => ({loc: location(a[0])(a[2]), properties: a[1]}))(lexer);
}


function prop(lexer) {
    return C.andMap([
        C.token(Errors)(Tokens.NAME),
        C.token(Errors)(Tokens.COLON),
        unionType,
        C.token(Errors)(Tokens.SEMICOLON)
    ])(a => ESTreeAST.Property(location(a[0])(a[3]), valueOf(a[0]), a[2]))(lexer);
}


function unionType(lexer) {
    const unionLocation = items =>
        ESTreeAST.SourceLocation(items[0].loc.source, items[0].loc.start, items[items.length-1].loc.end);

    return C.chainl1Map(type)(C.token(Errors)(Tokens.BAR))(a => Array.length(a) === 1 ? a[0] : ESTreeAST.Union(unionLocation(a), a))(lexer);
}


function type(lexer) {
    return C.or(Errors)([
        literal,
        C.tokenMap(Errors)(Tokens.NAME)(t => ESTreeAST.Reference(locationAt(t), valueOf(t))),
        C.andMap([
            C.token(Errors)(Tokens.LSQUARE),
            unionType,
            C.token(Errors)(Tokens.RSQUARE)
        ])(a => ESTreeAST.Array(location(a[0])(a[2]), a[1])),
        C.map(object)(v => ESTreeAST.$Object(v.loc, v.properties))
    ])(lexer);
}


function literal(lexer) {
    return C.or(Errors)([
        tokenConstant(Tokens.NULL)(null),
        tokenConstant(Tokens.TRUE)(true),
        tokenConstant(Tokens.FALSE)(false),
        C.tokenMap(Errors)(Tokens.constantInteger)(t => ESTreeAST.Literal(locationAt(t), valueOf(t))),
        C.tokenMap(Errors)(Tokens.constantString)(t => ESTreeAST.Literal(locationAt(t), valueOf(t)))
    ])(lexer);
}


const valueOf = token =>
    token.state.token.value;


const token = t =>
    C.tokenMap(Errors)(t)(valueOf);


const tokenConstant = t => c => lexer =>
    C.tokenMap(Errors)(t)(_ => ESTreeAST.Literal(locationAt(_), c))(lexer);


const stretchSourceLocation = startLocation => endLocation =>
    ESTreeAST.SourceLocation(startLocation.source, startLocation.start, endLocation.end);


const location = fromToken => toToken =>
    ESTreeAST.SourceLocation(fromToken.source().withDefault(null), positionStart(fromToken), positionEnd(toToken));


const locationAt = t =>
    ESTreeAST.SourceLocation(t.source().withDefault(null), positionStart(t), positionEnd(t));


const positionStart = t =>
    ESTreeAST.Position(t.position()[1], t.position()[0] - 1);


const positionEnd = t =>
    ESTreeAST.Position(t.position()[3], t.position()[2] - 1);


module.exports = {
    program
};