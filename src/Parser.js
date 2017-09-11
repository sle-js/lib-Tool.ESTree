const Array = require("./Libs").Array;
const C = require("./ParseCombinators");
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
        ])(a => ({name: tokenValue(a[1]), value: {kind: "interface", props: a[2], base: []}})),
        C.andMap([
            C.token(Tokens.INTERFACE),
            C.token(Tokens.NAME),
            C.token(Tokens.LESS_COLON),
            C.chainl1(C.tokenMap(Tokens.NAME)(t => t.state.token.value))(C.token(Tokens.COMMA)),
            object
        ])(a => ({name: tokenValue(a[1]), value: {kind: "interface", props: a[4], base: a[3]}})),
        C.andMap([
            C.token(Tokens.ENUM),
            C.token(Tokens.NAME),
            C.token(Tokens.LCURLY),
            C.chainl1(literal)(C.token(Tokens.BAR)),
            C.token(Tokens.RCURLY)
        ])(a => ({name: tokenValue(a[1]), value: {kind: "enum", values: a[3]}}))
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
    ])(a => ({name: tokenValue(a[0]), type: a[2]}))(lexer);
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
        C.tokenMap(Tokens.NAME)(t => ({kind: "reference", name: tokenValue(t)})),
        C.andMap([
            C.token(Tokens.LSQUARE),
            unionType,
            C.token(Tokens.RSQUARE)
        ])(a => ({kind: "array", base: a[1]})),
        C.map(object)(v => ({kind: object, values: v}))
    ])(lexer);
}


function literal(lexer) {
    return C.orMap([
        C.tokenMap(Tokens.NULL)(_ => null),
        C.tokenMap(Tokens.TRUE)(_ => true),
        C.tokenMap(Tokens.FALSE)(_ => false),
        C.tokenMap(Tokens.constantInteger)(t => t.state.token.value),
        C.tokenMap(Tokens.constantString)(t => t.state.token.value)
    ])(a => ({kind: "literal", value: a}))(lexer);
}


const tokenValue = token =>
    token.state.token.value;


module.exports = {
    program
};