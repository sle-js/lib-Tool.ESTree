const Array = require("./Libs").Array;
const C = require("./ParseCombinators");
const Errors = require("./Errors");
const ESTreeAST = require("./ESTreeAST");
const Tokens = require("./Tokens");


const errorLocation = lexer =>
    Errors.Location(lexer.state.source.withDefault(""))(Errors.Position(lexer.state.position[1])(lexer.state.position[0]));


const expectedTokenError = t =>
    lexer => Errors.ExpectedTokens(errorLocation(lexer))({id: lexer.state.token.id, symbol: Tokens.names[lexer.state.token.id], value: lexer.state.token.value})([{id: t, symbol: Tokens.names[t]}]);


const token = t =>
    C.token(expectedTokenError(t))(t);


const tokenMap = t =>
    C.tokenMap(expectedTokenError(t))(t);


const or =
    C.or(Errors.orFailed);


function program(lexer) {
    return C.andMap([
        C.many(def),
        token(Tokens.eof)
    ])(a => a[0])(lexer);
}


function def(lexer) {
    return or([
        C.andMap([
            token(Tokens.INTERFACE),
            token(Tokens.NAME),
            object
        ])(a => ESTreeAST.Interface(stretchSourceLocation(locationAt(a[0]))(a[2].loc), valueOf(a[1]), a[2].properties, [])),
        C.andMap([
            token(Tokens.EXTEND),
            token(Tokens.INTERFACE),
            token(Tokens.NAME),
            object
        ])(a => ESTreeAST.ExtendInterface(stretchSourceLocation(locationAt(a[0]))(a[3].loc), valueOf(a[2]), a[3].properties)),
        C.andMap([
            token(Tokens.INTERFACE),
            token(Tokens.NAME),
            token(Tokens.LESS_COLON),
            C.chainl1(tokenValue(Tokens.NAME))(token(Tokens.COMMA)),
            object
        ])(a => ESTreeAST.Interface(stretchSourceLocation(locationAt(a[0]))(a[4].loc), valueOf(a[1]), a[4].properties, a[3])),
        C.andMap([
            token(Tokens.ENUM),
            token(Tokens.NAME),
            token(Tokens.LCURLY),
            C.chainl1(literal)(token(Tokens.BAR)),
            token(Tokens.RCURLY)
        ])(a => ESTreeAST.Enum(location(a[0])(a[4]), valueOf(a[1]), a[3]))
    ])(lexer);
}


function object(lexer) {
    return C.andMap([
        token(Tokens.LCURLY),
        C.many(prop),
        token(Tokens.RCURLY)
    ])(a => ({loc: location(a[0])(a[2]), properties: a[1]}))(lexer);
}


function prop(lexer) {
    return C.andMap([
        token(Tokens.NAME),
        token(Tokens.COLON),
        unionType,
        token(Tokens.SEMICOLON)
    ])(a => ESTreeAST.Property(location(a[0])(a[3]), valueOf(a[0]), a[2]))(lexer);
}


function unionType(lexer) {
    const unionLocation = items =>
        ESTreeAST.SourceLocation(items[0].loc.source, items[0].loc.start, items[items.length-1].loc.end);

    return C.chainl1Map(type)(token(Tokens.BAR))(a => Array.length(a) === 1 ? a[0] : ESTreeAST.Union(unionLocation(a), a))(lexer);
}


function type(lexer) {
    return or([
        literal,
        tokenMap(Tokens.NAME)(t => ESTreeAST.Reference(locationAt(t), valueOf(t))),
        C.andMap([
            token(Tokens.LSQUARE),
            unionType,
            token(Tokens.RSQUARE)
        ])(a => ESTreeAST.Array(location(a[0])(a[2]), a[1])),
        C.map(object)(v => ESTreeAST.$Object(v.loc, v.properties))
    ])(lexer);
}


function literal(lexer) {
    return or([
        tokenConstant(Tokens.NULL)(null),
        tokenConstant(Tokens.TRUE)(true),
        tokenConstant(Tokens.FALSE)(false),
        tokenMap(Tokens.constantInteger)(t => ESTreeAST.Literal(locationAt(t), valueOf(t))),
        tokenMap(Tokens.constantString)(t => ESTreeAST.Literal(locationAt(t), valueOf(t)))
    ])(lexer);
}


const valueOf = token =>
    token.state.token.value;


const tokenValue = t =>
    tokenMap(t)(valueOf);


const tokenConstant = t => c => lexer =>
    tokenMap(t)(_ => ESTreeAST.Literal(locationAt(_), c))(lexer);


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