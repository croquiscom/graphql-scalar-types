"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const GraphQLScalarType = require("graphql").GraphQLScalarType;
const GraphQLError = require("graphql/error").GraphQLError;
const Kind = require("graphql/language").Kind;

exports.CrJSON = new GraphQLScalarType({
  name: 'CrJSON',
  description: 'JSON custom scalar type',
  parseValue: JSONValidater,
  serialize: JSONValidater,
  parseLiteral: JSONparseLiteral
});

function JSONValidater(value) {
  let string_to_json;
  let object_to_string = value;
  const value_type = typeof value;
  if (value_type != 'string' && value_type != 'object') {
    throw new TypeError(`Value is not a valid type: ${value_type.toUpperCase()}`);
  } else if (value_type == 'object') {
    object_to_string = JSON.stringify(object_to_string);
    if (!object_to_string) {
      throw new TypeError('Value is not a valid JSON');
    }
  }

  try {
    string_to_json = JSON.parse(object_to_string);
  } catch(error) {
    throw new TypeError('Value is not a valid JSON');
  }

  console.log(string_to_json);

  return string_to_json;
}

function JSONparseLiteral(ast, variables) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT: {
      var value = Object.create(null);
      ast.fields.forEach(function(field) {
        value[field.name.value] = JSONparseLiteral(field.value, variables);
      });

      return value;
    }
    case Kind.LIST:
      return ast.values.map(function(n) {
        return JSONparseLiteral(n, variables);
      });
    case Kind.NULL:
      return null;
    case Kind.VARIABLE: {
      var name = ast.name.value;
      return variables ? variables[name] : undefined;
    }
    default:
      return undefined;
  }
}
