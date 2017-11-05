const Node = (kind, loc) =>
    ({kind, loc});


const SourceLocation = (source, start, end) =>
    ({source, start, end});


const Position = (line, column) =>
    ({line, column});


const Name = (loc, name) =>
    Object.assign({},
        Node("Name", loc),
        {kind: "Name", name});


const Declaration = (kind, loc, name) =>
    Object.assign({},
        Node(kind, loc),
        {name});


const Interface = (loc, name, props, base) =>
    Object.assign({},
        Declaration("Interface", loc, name),
        {kind: "Interface", props, base});


const ExtendInterface = (loc, name, props) =>
    Object.assign({},
        Declaration("ExtendInterface", loc, name),
        {kind: "ExtendInterface", props});


const Enum = (loc, name, values) =>
    Object.assign({},
        Declaration("Enum", loc, name),
        {kind: "Enum", values});


const Property = (loc, name, value) =>
    Object.assign({},
        Node("Property", loc),
        {kind: "Property", name, value});


const Type = (kind, loc) =>
    Object.assign({},
        Node(kind, loc));


const Union = (loc, types) =>
    Object.assign({},
        Type("Union", loc),
        {kind: "Union", types});


const Literal = (loc, value) =>
    Object.assign({},
        Type("Literal", loc),
        {kind: "Literal", value});


const Reference = (loc, name) =>
    Object.assign({},
        Type("Reference", loc),
        {kind: "Reference", name});


const Array = (loc, base) =>
    Object.assign({},
        Type("Array", loc),
        {kind: "Array", base});


const Object = (loc, items) =>
    Object.assign({},
        Type("Object", loc),
        {kind: "Object", items});


const Program = (loc, importURL, declarations) =>
    Object.assign({},
        Node("Program", loc),
        {kind: "Program", importURL, declarations});


module.exports = {
    Node,
    SourceLocation,
    Position,
    Name,
    Declaration,
    Interface,
    ExtendInterface,
    Enum,
    Property,
    Type,
    Union,
    Literal,
    Reference,
    Array,
    Object,
    Program
};