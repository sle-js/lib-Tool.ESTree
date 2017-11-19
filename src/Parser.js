module.exports = $importAll([
    "./Libs",
    "./Errors",
    "./ESTreeAST",
    "./Tokens"
]).then($imports => {
    const Array = $imports[0].Array;
    const C = $imports[0].Combinators;
    const Errors = $imports[1];
    const ESTreeAST = $imports[2];
    const Maybe = $imports[0].Maybe;
    const Tokens = $imports[3];


    const transformColumn = column =>
        column;


    const transformRow = row =>
        row - 1;


    const errorLocation = token =>
        Errors.Location(token.state.source.withDefault(""))(Errors.Position(transformColumn(token.position()[1]))(transformRow(token.position()[0])));


    const expectedTokensError = tokenIDs => token => {
        const foundToken = token => ({
            id: token.id,
            symbol: Tokens.names[token.id],
            value: token.value
        });

        const expectedTokens = Array.map(tokenID => ({
            id: tokenID,
            symbol: Tokens.names[tokenID]
        }))(tokenIDs);

        return Errors.ExpectedTokens(errorLocation(token))(foundToken(token.state.token))(expectedTokens);
    };


    const expectedTokenError = tokenID =>
        expectedTokensError([tokenID]);


    const token = t =>
        C.token(expectedTokenError(t))(t);


    const tokenMap = t =>
        C.tokenMap(expectedTokenError(t))(t);


    const or = expectedTokens =>
        C.or(expectedTokensError(expectedTokens));


    function program(lexer) {
        return C.andMap([
            C.optional(C.and([
                C.backtrack(token(Tokens.IMPORT)),
                tokenMap(Tokens.constantURL)(t => ESTreeAST.Literal(locationAt(t), valueOf(t))),
                token(Tokens.SEMICOLON)
            ])),
            C.many(def),
            token(Tokens.eof)
        ])(a => ESTreeAST.Program(stretchSourceLocation(a[0].map(aa => locationAt(aa[0])).withDefault(locationFromNodes(a[1]).withDefault(a[2])))(locationAt(a[2])), a[0].map(aa => aa[1]).withDefault(null), a[1]))(lexer);
    }


    function def(lexer) {
        return or([Tokens.INTERFACE, Tokens.EXTEND, Tokens.ENUM])([
            C.andMap([
                C.backtrack(token(Tokens.INTERFACE)),
                tokenName,
                C.optionalMap(
                    C.andMap([
                        C.backtrack(token(Tokens.LESS_COLON)),
                        C.sepBy1(tokenName)(C.backtrack(token(Tokens.COMMA)))
                    ])(a => a[1])
                )(a => a.withDefault([])),
                object
            ])(a => ESTreeAST.Interface(stretchSourceLocation(locationAt(a[0]))(a[3].loc), a[1], a[3].properties, a[2])),
            C.andMap([
                C.backtrack(token(Tokens.EXTEND)),
                token(Tokens.INTERFACE),
                tokenName,
                object
            ])(a => ESTreeAST.ExtendInterface(stretchSourceLocation(locationAt(a[0]))(a[3].loc), a[2], a[3].properties)),
            C.andMap([
                C.backtrack(token(Tokens.ENUM)),
                tokenName,
                token(Tokens.LCURLY),
                C.sepBy1(literal)(C.backtrack(token(Tokens.BAR))),
                token(Tokens.RCURLY)
            ])(a => ESTreeAST.Enum(location(a[0])(a[4]), a[1], a[3]))
        ])(lexer);
    }


    function object(lexer) {
        return C.andMap([
            C.backtrack(token(Tokens.LCURLY)),
            C.many(prop),
            token(Tokens.RCURLY)
        ])(a => ({loc: location(a[0])(a[2]), properties: a[1]}))(lexer);
    }


    function prop(lexer) {
        return C.andMap([
            C.backtrack(tokenName),
            token(Tokens.COLON),
            unionType,
            token(Tokens.SEMICOLON)
        ])(a =>
            ESTreeAST.Property(stretchSourceLocation(a[0].loc)(locationAt(a[3])), a[0], a[2]))(lexer);
    }


    function unionType(lexer) {
        return C.chainl1Map(type)(C.backtrack(token(Tokens.BAR)))(a => Array.length(a) === 1 ? a[0] : ESTreeAST.Union(locationFromNodes(a).withDefault(null), a))(lexer);
    }


    function type(lexer) {
        return or([Tokens.NULL, Tokens.TRUE, Tokens.FALSE, Tokens.constantInteger, Tokens.constantString, Tokens.NAME, Tokens.LSQUARE, Tokens.LCURLY])([
            C.backtrack(literal),
            C.backtrack(tokenNameMap(t => ESTreeAST.Reference(t.loc, t))),
            C.andMap([
                C.backtrack(token(Tokens.LSQUARE)),
                unionType,
                token(Tokens.RSQUARE)
            ])(a => ESTreeAST.Array(location(a[0])(a[2]), a[1])),
            C.map(object)(v => ESTreeAST.$Object(v.loc, v.properties))
        ])(lexer);
    }


    function literal(lexer) {
        return or([Tokens.NULL, Tokens.TRUE, Tokens.FALSE, Tokens.constantInteger, Tokens.constantString])([
            C.backtrack(tokenConstant(Tokens.NULL)(null)),
            C.backtrack(tokenConstant(Tokens.TRUE)(true)),
            C.backtrack(tokenConstant(Tokens.FALSE)(false)),
            C.backtrack(tokenMap(Tokens.constantInteger)(t => ESTreeAST.Literal(locationAt(t), valueOf(t)))),
            C.backtrack(tokenMap(Tokens.constantString)(t => ESTreeAST.Literal(locationAt(t), valueOf(t))))
        ])(lexer);
    }


    const valueOf = token =>
        token.state.token.value;


    const tokenName = lexer =>
        tokenMap(Tokens.NAME)(t => ESTreeAST.Name(locationAt(t), t.state.token.value))(lexer);


    const tokenNameMap = f => lexer =>
        tokenMap(Tokens.NAME)(t => f(ESTreeAST.Name(locationAt(t), t.state.token.value)))(lexer);


    const tokenConstant = t => c => lexer =>
        tokenMap(t)(_ => ESTreeAST.Literal(locationAt(_), c))(lexer);


    const stretchSourceLocation = startLocation => endLocation =>
        ESTreeAST.SourceLocation(startLocation.source, startLocation.start, endLocation.end);


    const location = fromToken => toToken =>
        ESTreeAST.SourceLocation(fromToken.source().withDefault(null), positionStart(fromToken), positionEnd(toToken));


    const locationAt = t =>
        ESTreeAST.SourceLocation(t.source().withDefault(null), positionStart(t), positionEnd(t));


    const positionStart = t =>
        ESTreeAST.Position(transformColumn(t.position()[1]), transformRow(t.position()[0]));


    const positionEnd = t =>
        ESTreeAST.Position(transformColumn(t.position()[3]), transformRow(t.position()[2]));


    const locationFromNodes = nodes =>
        Array.length(nodes) === 0
            ? Maybe.Nothing
            : Maybe.Just(ESTreeAST.SourceLocation(nodes[0].loc.source, nodes[0].loc.start, nodes[nodes.length - 1].loc.end));


    return {
        program
    };
});
