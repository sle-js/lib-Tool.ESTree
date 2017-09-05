let runner = -1;
nextToken = () => {
    const value = runner;
    runner += 1;
    return value;
};

const err = nextToken();
const eof = nextToken();

const constantInteger = nextToken();
const constantString = nextToken();

const INTERFACE = nextToken();
const ENUM = nextToken();
const EXTEND = nextToken();
const TRUE = nextToken();
const FALSE = nextToken();
const NULL = nextToken();
const NAME = nextToken();

const LESS_COLON = nextToken();
const LCURLY = nextToken();
const RCURLY = nextToken();
const COMMA = nextToken();
const BAR = nextToken();
const COLON = nextToken();
const SEMICOLON = nextToken();
const LSQUARE = nextToken();
const RSQUARE = nextToken();


const names = {};

names[err] = "error";
names[eof] = "end-of-file";
names[constantInteger] = "constant integer";
names[constantString] = "constant string";
names[INTERFACE] = "interface";
names[ENUM] = "enum";
names[EXTEND] = "extend";
names[TRUE] = "true";
names[FALSE] = "false";
names[NULL] = "null";
names[NAME] = "name";
names[LESS_COLON] = "<:";
names[LCURLY] = "{";
names[RCURLY] = "}";
names[COMMA] = ",";
names[BAR] = "|";
names[COLON] = ":";
names[SEMICOLON] = ";";
names[LSQUARE] = "[";
names[RSQUARE] = "]";


module.exports = {
    names,

    err,
    eof,
    constantInteger,
    constantString,

    INTERFACE,
    ENUM,
    EXTEND,
    TRUE,
    FALSE,
    NULL,
    NAME,
    LESS_COLON,
    LCURLY,
    RCURLY,
    COMMA,
    BAR,
    COLON,
    SEMICOLON,
    LSQUARE,
    RSQUARE
};