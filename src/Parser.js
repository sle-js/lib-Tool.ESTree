const C = require("./ParseCombinators");
const Tokens = require("./Tokens");


function program(lexer) {
    return C.andMap([
        C.many(def),
        C.token(Tokens.eof)
    ])(a => a[0])(lexer);
}


function def(lexer) {
    return C.andMap([
        C.token(Tokens.INTERFACE),
        C.token(Tokens.NAME),
        object
    ])(a => ({name: tokenValue(a[1]), value: {kind: "interface", props: a[2], base: []}}))(lexer);
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
        type,
        C.token(Tokens.SEMICOLON)
    ])(a => ({name: tokenValue(a[0]), type: a[2]}))(lexer);
}


function type(lexer) {
    return C.tokenMap(Tokens.NAME)(t => ({kind: "reference", name: tokenValue(t)}))(lexer);
}


const tokenValue = token =>
    token.state.token.value;


module.exports = {
    program
};