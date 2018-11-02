"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const error_1 = require("graphql/error");
const language_1 = require("graphql/language");
function identity(value) {
    if (!(value instanceof Object)) {
        throw new TypeError(`Value is not an instance of Object : ${value}`);
    }
    return value;
}
function _parseLiteral(valueAST, variables) {
    switch (valueAST.kind) {
        case language_1.Kind.STRING:
        case language_1.Kind.BOOLEAN:
            return valueAST.value;
        case language_1.Kind.INT:
        case language_1.Kind.FLOAT:
            return parseFloat(valueAST.value);
        case language_1.Kind.OBJECT: {
            const value = {};
            valueAST.fields.forEach((field) => {
                value[field.name.value] = _parseLiteral(field.value, variables);
            });
            return value;
        }
        case language_1.Kind.LIST:
            return valueAST.values.map((value) => _parseLiteral(value, variables));
        case language_1.Kind.NULL:
            return null;
        case language_1.Kind.VARIABLE: {
            const name = valueAST.name.value;
            return variables ? variables[name] : undefined;
        }
        default:
            return undefined;
    }
}
// tslint:disable-next-line:variable-name
exports.CrJson = new graphql_1.GraphQLScalarType({
    name: 'CrJson',
    description: 'Serve Json object',
    serialize: identity,
    parseValue: identity,
    parseLiteral(valueAST, variables) {
        if (valueAST.kind !== language_1.Kind.OBJECT) {
            throw new error_1.GraphQLError(`Can only parse json object but got a: ${valueAST.kind}`);
        }
        const result = _parseLiteral(valueAST, variables);
        return result;
    },
});
