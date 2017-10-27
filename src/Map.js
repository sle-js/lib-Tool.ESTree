const Maybe = require("./Libs").Maybe;


const empty =
    new Map();


const singleton = k => v =>
    new Map().set(k, v);


const insert = k => v => m =>
    new Map(m).set(k, v);


const get = k => m => {
    const value =
        m.get(k);

    return value === undefined
        ? Maybe.Nothing
        : Maybe.Just(value);
};


const values = m =>
    [... m.values()];


module.exports = {
    empty,
    singleton,
    insert,
    get,
    values
};