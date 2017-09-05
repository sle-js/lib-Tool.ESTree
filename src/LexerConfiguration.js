const Int = require("./Int");
const Lexer = require("./Lexer");
const Maybe = require("./Libs").Maybe;
const Regex = require("./Regex");
const Tokens = require("./Tokens");


const identifiers = {
    interface: Tokens.INTERFACE,
    enum: Tokens.ENUM,
    extend: Tokens.EXTEND,
    true: Tokens.TRUE,
    false: Tokens.FALSE,
    null: Tokens.NULL
};


const resolveIdentifier = text => {
    const identifier = identifiers[text];

    return identifier === undefined
        ? {id: Tokens.NAME, value: text}
        : {id: identifier, value: text};
};


module.exports = Lexer.setup({
    eof: {id: Tokens.eof, value: ""},
    err: text => ({id: Tokens.err, value: text}),
    whitespacePattern: Maybe.Just(Regex.from(/\s+/iy)),
    tokenPatterns: [
        [Regex.from(/\d+/iy), text => ({id: Tokens.constantInteger, value: Int.fromString(text).withDefault(0)})],
        [Regex.from(/"(\\.|[^"\\])*"/iy), text => ({id: Tokens.constantString, value: text.substring(1, text.length - 1)})],

        [Regex.from(/\|/iy), text => ({id: Tokens.BAR, value: text})],
        [Regex.from(/:/iy), text => ({id: Tokens.COLON, value: text})],
        [Regex.from(/,/iy), text => ({id: Tokens.COMMA, value: text})],
        [Regex.from(/{/iy), text => ({id: Tokens.LCURLY, value: text})],
        [Regex.from(/\[/iy), text => ({id: Tokens.LSQUARE, value: text})],
        [Regex.from(/<:/iy), text => ({id: Tokens.LESS_COLON, value: text})],
        [Regex.from(/}/iy), text => ({id: Tokens.RCURLY, value: text})],
        [Regex.from(/]/iy), text => ({id: Tokens.RSQUARE, value: text})],
        [Regex.from(/;/iy), text => ({id: Tokens.SEMICOLON, value: text})],

        [Regex.from(/[A-Za-z_][A-Za-z0-9_]*/y), text => resolveIdentifier(text)]
    ],
    comments: [
        {open: Regex.from(/\/\//my), close: Regex.from(/\n/my), nested: false},
        {open: Regex.from(/\/\*/my), close: Regex.from(/\*\//my), nested: true}
    ]
});
