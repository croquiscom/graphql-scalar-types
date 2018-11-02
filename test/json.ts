import { expect } from 'chai';
import { graphql, GraphQLBoolean, GraphQLInt, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { CrJson } from '..';

const json_fixture = {
  string: 'string',
  int: 3,
  float: 3.14,
  true: true,
  false: false,
  null: null,
  object: {
    string: 'string',
    int: 3,
    float: 3.14,
    true: true,
    false: false,
    null: null,
  },
  array: [
    'string',
    3,
    3.14,
    true,
    false,
    null,
  ],
};

const json_literal = `{
  string: "string",
  int: 3,
  float: 3.14,
  true: true,
  false: false,
  null: null,
  object: {
    string: "string",
    int: 3,
    float: 3.14,
    true: true,
    false: false,
    null: null,
  },
  array: [
    "string",
    3,
    3.14,
    true,
    false,
    null,
  ],
}`;

describe('CrJson', () => {
  describe('serialize', () => {
    it('valid json', async () => {
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              resolve: () => json_fixture,
              type: CrJson,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql(schema, '{ query }');
      expect(result.data).to.eql({ query: json_fixture });
      expect(result).to.not.have.property('errors');
    });

    it('invalid json', async () => {
      const invalid_json_fixture = 'a';
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              resolve: () => invalid_json_fixture,
              type: CrJson,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql(schema, '{ query }');
      expect(result.data).to.eql({ query: null });
      expect(result.errors![0].message).to.eql('Value is not an instance of Object : a');
    });
  });

  describe('parseValue', () => {
    it('valid json', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJson,
                },
              },
              resolve: (_, { input }) => {
                value = input;
                return true;
              },
              type: GraphQLBoolean,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql(schema, 'query($input: CrJson) { query(input: $input) }',
        null, null, { input: json_fixture });
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.instanceof(Object);
      expect(value).to.eql(json_fixture);
    });

    it('invalid json', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJson,
                },
              },
              resolve: (_, { input }) => {
                value = input;
                return true;
              },
              type: GraphQLBoolean,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql(schema, 'query($input: CrJson) { query(input: $input) }',
        null, null, { input: 'a' });
      expect(result.data).to.eql(undefined);
      const msg = 'Variable "$input" got invalid value "a"; Expected type CrJson; Value is not an instance of Object : a';
      expect(result.errors![0].message).to.eql(msg);
      expect(value).to.eql(undefined);
    });
  });

  describe('parseLiteral', () => {
    it('valid json - without variable', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJson,
                },
              },
              resolve: (_, { input }) => {
                value = input;
                return true;
              },
              type: GraphQLBoolean,
            },
          },
          name: 'Query',
        }),
      });

      const result = await graphql(schema, `{ query(input: ${json_literal}) }`);
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.instanceof(Object);
      expect(value).to.eql(json_fixture);
    });

    it('valid json - with variable', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJson,
                },
              },
              resolve: (_, { input }) => {
                value = input;
                return true;
              },
              type: GraphQLBoolean,
            },
          },
          name: 'Query',
        }),
        types: [GraphQLInt],
      });

      const result = await graphql(schema, `
        query ($intValue: Int = 3) {
          query(input: {
            string: "string",
            int: $intValue,
            float: 3.14,
            true: true,
            false: false,
            null: null,
            object: {
              string: "string",
              int: $intValue,
              float: 3.14,
              true: true,
              false: false,
              null: null,
            },
            array: [
              "string",
              $intValue,
              3.14,
              true,
              false,
              null,
            ],
          }),
        }
      `);
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.instanceof(Object);
      expect(value).to.eql(json_fixture);
    });

    it('invalid json', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJson,
                },
              },
              resolve: (_, { input }) => {
                value = input;
                return true;
              },
              type: GraphQLBoolean,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql(schema, `{ query(input: "a") }`);
      expect(result.data).to.eql(undefined);
      const msg = 'Expected type CrJson, found "a"; Can only parse json object but got a: StringValue';
      expect(result.errors![0].message).to.eql(msg);
      expect(value).to.eql(undefined);
    });
  });
});
