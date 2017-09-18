const Array = require("./Libs").Array;
const C = require("./ParseCombinators");
const ESTreeAST = require("./ESTreeAST");
const Tokens = require("./Tokens");


function program(lexer) {
    return C.andMap([
        C.many(def),
        C.token(Tokens.eof)
    ])(a => a[0])(lexer);
}


function def(lexer) {
    return C.or([
        C.andMap([
            C.token(Tokens.INTERFACE),
            C.token(Tokens.NAME),
            object
        ])(a => ({name: valueOf(a[1]), value: {kind: "interface", props: a[2], base: []}})),
        C.andMap([
            C.token(Tokens.INTERFACE),
            C.token(Tokens.NAME),
            C.token(Tokens.LESS_COLON),
            C.chainl1(token(Tokens.NAME))(C.token(Tokens.COMMA)),
            object
        ])(a => ({name: valueOf(a[1]), value: {kind: "interface", props: a[4], base: a[3]}})),
        C.andMap([
            C.token(Tokens.ENUM),
            C.token(Tokens.NAME),
            C.token(Tokens.LCURLY),
            C.chainl1(literal)(C.token(Tokens.BAR)),
            C.token(Tokens.RCURLY)
        ])(a => ({name: valueOf(a[1]), value: {kind: "enum", values: a[3]}}))
    ])(lexer);
}


function object(lexer) {
    return C.andMap([
        C.token(Tokens.LCURLY),
        C.many(prop),
        C.token(Tokens.RCURLY)
    ])(a => a[1])(lexer);
}


function prop(lexer) {
    return C.andMap([
        C.token(Tokens.NAME),
        C.token(Tokens.COLON),
        unionType,
        C.token(Tokens.SEMICOLON)
    ])(a => ({name: valueOf(a[0]), type: a[2]}))(lexer);
}


function unionType(lexer) {
    return C.chainl1Map(type)(C.token(Tokens.BAR))(a => Array.length(a) === 1 ? a[0] : ({
        kind: "union",
        types: a
    }))(lexer);
}


function type(lexer) {
    return C.or([
        literal,
        C.tokenMap(Tokens.NAME)(t => ({kind: "reference", name: valueOf(t)})),
        C.andMap([
            C.token(Tokens.LSQUARE),
            unionType,
            C.token(Tokens.RSQUARE)
        ])(a => ESTreeAST.Array(location(a[0])(a[2]), a[1])),
        C.map(object)(v => ({kind: object, values: v}))
    ])(lexer);
}


function literal(lexer) {
    return C.or([
        tokenConstant(Tokens.NULL)(null),
        tokenConstant(Tokens.TRUE)(true),
        tokenConstant(Tokens.FALSE)(false),
        C.tokenMap(Tokens.constantInteger)(t => ESTreeAST.Literal(locationAt(t), valueOf(t))),
        C.tokenMap(Tokens.constantString)(t => ESTreeAST.Literal(locationAt(t), valueOf(t)))
    ])(lexer);
}


const valueOf = token =>
    token.state.token.value;


const token = t =>
    C.tokenMap(t)(valueOf);


const tokenConstant = t => c => lexer =>
    C.tokenMap(t)(_ => ESTreeAST.Literal(locationAt(_), c))(lexer);


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