const Array = require("./Libs").Array;
const Maybe = require("./Libs").Maybe;
const Result = require("./Result");


const okayResult = lexer => result =>
    Result.Okay({lexer: lexer, result: result});


const errorResult = lexer => result =>
    Result.Error({lexer: lexer, result: result});


const mapResult = f => result =>
    result.map(r => ({lexer: r.lexer, result: f(r.result)}));


const map = parser => f => lexer =>
    mapResult(f)(parser(lexer));


const andThen = currentResult => parser =>
    currentResult.andThen(s => mapResult(r => Array.append(r)(s.result))(parser(s.lexer)));


const and = parsers => lexer =>
    Array.foldl(okayResult(lexer)([]))(andThen)(parsers);


const andMap = parsers => f =>
    map(and(parsers))(f);


const manyResult = currentResult => parser => {
    const nextResult =
        andThen(currentResult)(parser);

    return nextResult.isOkay()
        ? manyResult(nextResult)(parser)
        : currentResult;
};


const many = parser => lexer =>
    manyResult(okayResult(lexer)([]))(parser);


const many1 = parser => lexer =>
    manyResult(mapResult(r => [r])(parser(lexer)))(parser);


const many1Map = parser => f =>
    map(many1(parser)(f));


const backtrackingOr = errorFn => parsers => lexer => {
    const parseOption = parser => {
        const optionResult = parser(lexer);

        return optionResult.isOkay()
            ? Maybe.Just(optionResult)
            : Maybe.Nothing;
    };

    return Array.findMap(parseOption)(parsers).withDefault(errorResult(lexer.tail())(errorFn(lexer.head())));
};


const or = errorFn => parsers => lexer => {
    const parseOption = parser => {
        const optionResult = parser(lexer);

        return optionResult.isOkay()
            ? Maybe.Just(optionResult)
            : optionResult.errorWithDefault(null).lexer.head().index() === lexer.head().index()
                ? Maybe.Nothing
                : Maybe.Just(optionResult);
    };

    return Array.findMap(parseOption)(parsers).withDefault(errorResult(lexer.tail())(errorFn(lexer.head())));
};



const orMap = error => parsers => f =>
    map(backtrackingOr(error)(parsers))(f);


const chainl1 = parser => sep => lexer => {
    const initialResult =
        mapResult(r => [r])(parser(lexer));

    const tailParser =
        andMap([sep, parser])(a => a[1]);

    if (initialResult.isOkay()) {
        return manyResult(initialResult)(tailParser);
    } else {
        return initialResult;
    }
};


const chainl1Map = parser => sep => f =>
    map(chainl1(parser)(sep))(f);


const condition = errorFn => f => lexer =>
    f(lexer.head())
        ? okayResult(lexer.tail())(lexer.head())
        : errorResult(lexer.tail())(errorFn(lexer.head()));


const conditionMap = errorFn => predicate => f =>
    map(condition(errorFn)(predicate))(f);


const token = errorFn => tokenID =>
    condition(errorFn)(h => h.token().id === tokenID);


const tokenMap = errorFn => tokenID => f =>
    map(token(errorFn)(tokenID))(f);


const optional = parser => lexer => {
    const result = parser(lexer);

    return result.isOkay()
        ? mapResult(Maybe.Just)(result)
        : okayResult(lexer)(Maybe.Nothing);
};


const optionalMap = parser => f =>
    map(optional(parser))(f);


const backtrack = parser => lexer => {
    const result = parser(lexer);

    return result.isOkay()
        ? result
        : result.mapError(error => ({lexer: lexer, result: error.result}));
};



module.exports = {
    and,
    andMap,
    backtrack,
    chainl1,
    chainl1Map,
    condition,
    conditionMap,
    many,
    many1,
    many1Map,
    map,
    optional,
    optionalMap,
    or,
    backtrackingOr,
    orMap,
    token,
    tokenMap,
};