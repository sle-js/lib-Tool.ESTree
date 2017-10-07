/*
 * This code is a handcrafted implementation of an ESTree AST.  The first part of this file will contain the definition
 * of the AST using ESTree notation with the remainder of the file holding the actual JavaScript.
 *
 * The idioms used in this will a continuation of what appears in the JavaScript AST.
 *
 * interface Node {
 *      kind: string;
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
 *      kind: "Interface";
 *      props: [ Property ];
 *      base: [ string ];
 * }
 *
 * interface Enum <: Declaration {
 *      kind: "Enum";
 *      values: [ string ];
 * }
 *
 * interface Property <: Node {
 *      kind: "Property";
 *      name: string;
 *      value: Type;
 * }
 *
 * interface Type <: Node { }
 *
 * interface Union <: Type {
 *      kind: "Union";
 *      types: [ Type ];
 * }
 *
 * interface Literal <: Type {
 *      kind: "Literal";
 *      value: string | number | boolean | null;
 * }
 *
 * interface Reference <: Type {
 *      kind: "Reference";
 *      name: string;
 * }
 *
 * interface Array <: Type {
 *      kind: "Array";
 *      base: Type;
 *
 * interface Object <: Type {
 *      kind: "Object";
 *      items: [ Property ];
 * }
 */

const Node = (kind, loc) =>
    ({kind, loc});


const SourceLocation = (source, start, end) =>
    ({source, start, end});


const Position = (line, column) =>
    ({line, column});


const Declaration = (kind, loc, name) =>
    Object.assign({},
        Node(kind, loc),
        {name});


const Interface = (loc, name, props, base) =>
    Object.assign({},
        Declaration("Interface", loc, name),
        {kind: "Interface", props, base});


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


const $Object = (loc, items) =>
    Object.assign({},
        Type("Object", loc),
        {kind: "Object", items});


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
    Array,
    $Object
};