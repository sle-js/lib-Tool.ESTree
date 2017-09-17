/*
 * This code is a handcrafted implementation of an ESTree AST.  The first part of this file will contain the definition
 * of the AST using ESTree notation with the remainder of the file holding the actual JavaScript.
 *
 * The idioms used in this will a continuation of what appears in the JavaScript AST.
 *
 * interface Node {
 *      type: string;
 *      loc: SourceLocation | null;
 * }
 *
 * interface SourceLocation {
 *      source: string | null;
 *      start: Position;
 *      end: Position;
 * }
 *
 * interface Position {
 *      line: number;
 *      column: number;
 * }
 *
 * interface Declaration <: Node {
 *      name: string;
 * }
 *
 * interface Interface <: Declaration {
 *      type: "Interface";
 *      props: [ Property ];
 *      base: [ string ];
 * }
 *
 * interface Enum <: Declaration {
 *      type: "Enum";
 *      values: [ string ];
 * }
 *
 * interface Property <: Node {
 *      type: "Property";
 *      name: string;
 *      value: Type;
 * }
 *
 * interface Type <: Node { }
 *
 * interface Union <: Type {
 *      type: "Union";
 *      types: [ Type ];
 * }
 *
 * interface Literal <: Type {
 *      type: "Literal";
 *      value: string | number | boolean | null;
 * }
 *
 * interface Reference <: Type {
 *      type: "Reference";
 *      name: string;
 * }
 *
 * interface Array <: Type {
 *      type: "Array";
 *      base: Type;
 * }
 */

const Node = (type, loc) =>
    ({type, loc});


const SourceLocation = (source, start, end) =>
    ({source, start, end});


const Position = (line, column) =>
    ({line, column});


const Declaration = (type, loc, name) =>
    Object.assign({},
        Node(type, loc),
        {name});


const Interface = (loc, name, props, base) =>
    Object.assign({},
        Declaration("Interface", loc, name),
        {type: "Interface", props, base});


const Enum = (loc, name, values) =>
    Object.assign({},
        Declaration("Enum", loc, name),
        {type: "Enum", values});


const Property = (loc, name, value) =>
    Object.assign({},
        Node("Property", loc),
        {type: "Property", name, value});


const Type = (type, loc) =>
    Object.assign({},
        Node(type, loc));


const Union = (loc, types) =>
    Object.assign({},
        Type("Union", loc),
        {type: "Union", types});


const Literal = (loc, value) =>
    Object.assign({},
        Type("Literal", loc),
        {type: "Literal", value});


const Reference = (loc, name) =>
    Object.assign({},
        Type("Reference", loc),
        {type: "Reference", name});


const Array = (loc, base) =>
    Object.assign({},
        Type("Array", loc),
        {type: "Array", base});


module.exports = {
    Node,
    SourceLocation,
    Position,
    Declaration,
    Interface,
    Enum,
    Property,
    Type,
    Union,
    Literal,
    Reference,
    Array
};