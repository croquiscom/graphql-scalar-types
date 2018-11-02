import { GraphQLScalarType } from 'graphql';
import { GraphQLError } from 'graphql/error';
import { Kind, ValueNode } from 'graphql/language';
import Maybe from 'graphql/tsutils/Maybe';
import { KnownDirectives } from 'graphql/validation/rules/KnownDirectives';

function identity(value: any) {
  if (!(value instanceof Object)) {
    throw new TypeError(`Value is not an instance of Object : ${value}`);
  }
  return value;
}

function _parseLiteral(valueAST: ValueNode, variables: Maybe<{ [key: string]: any }>): any {
  switch (valueAST.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return valueAST.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(valueAST.value);
    case Kind.OBJECT: {
      const value: {[ argName: string ]: any } = {};
      valueAST.fields.forEach((field) => {
        value[field.name.value] = _parseLiteral(field.value, variables);
      });
      return value;
    }
    case Kind.LIST:
      return valueAST.values.map((value) => _parseLiteral(value, variables));
    case Kind.NULL:
      return null;
    case Kind.VARIABLE: {
      const name = valueAST.name.value;
      return variables ? variables[name] : undefined;
    }
    default:
      return undefined;
  }
}

// tslint:disable-next-line:variable-name
export const CrJson = new GraphQLScalarType({
  name: 'CrJson',

  description: 'Serve Json object',

  serialize: identity,

  parseValue: identity,

  parseLiteral(valueAST: ValueNode, variables: Maybe<{ [key: string]: any }>) {
    if (valueAST.kind !== Kind.OBJECT) {
      throw new GraphQLError(`Can only parse json object but got a: ${valueAST.kind}`);
    }

    const result = _parseLiteral(valueAST, variables);
    return result;
  },
});
