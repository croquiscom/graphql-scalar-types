import { expect } from 'chai';
import { graphql, GraphQLBoolean, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { CrJSON } from '../lib';

describe('CrJSON', () => {
  describe('serialize', () => {
    it('valid json : string type json', async () => {
      const json_data = JSON.stringify({a: {b: 'a'}, b: ['c', 'd']});
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              resolve: () => json_data,
              type: CrJSON,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql(schema, '{ query }');
      expect(result).to.not.have.property('errors');
    });

    it('valid json : object type json', async () => {
      const json_data = {a: {b: 'a'}, b: ['c', 'd'] };
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              resolve: () => json_data,
              type: CrJSON,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql(schema, '{ query }');
      expect(result).to.not.have.property('errors');
    });

    it('invalid json : string type json', async () => {
      const json_data = '{a: {b: "a"} b: ["c", "d"]';
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              resolve: () => json_data,
              type: CrJSON,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql(schema, '{ query }');
      expect(result.data).to.eql({ query: null });
      expect(result.errors![0].message).to.eql('Value is not a valid JSON');
    });

    it('invalid json : float type json', async () => {
      const json_data = 11111.1111;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              resolve: () => json_data,
              type: CrJSON,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql(schema, '{ query }');
      expect(result.data).to.eql({ query: null });
      expect(result.errors![0].message).to.eql('Value is not a valid type: NUMBER');
    });

    it('invalid json : string type json', async () => {
      const json_data = 'qweqwewqewqewe';
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              resolve: () => json_data,
              type: CrJSON,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql(schema, '{ query }');
      expect(result.data).to.eql({ query: null });
      expect(result.errors![0].message).to.eql('Value is not a valid JSON');
    });

    it('invalid json : boolean type json', async () => {
      const json_data = true;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              resolve: () => json_data,
              type: CrJSON,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql(schema, '{ query }');
      expect(result.data).to.eql({ query: null });
      expect(result.errors![0].message).to.eql('Value is not a valid type: BOOLEAN');
    });

  });

  describe('parseValue', () => {
    it('valid JSON', async () => {
      const json_data = JSON.stringify({a: {b: 'a'}, b: ['c', 'd']});
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJSON,
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
      const result = await graphql(schema, 'query($input: CrJSON) { query(input: $input) }',
        null, null, { input: json_data });
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.eql(JSON.parse(json_data));
    });

    it('invalid JSON', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJSON,
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
      const result = await graphql(schema, 'query($input: CrJSON) { query(input: $input) }',
        null, null, { input: 'a' });
      expect(result.data).to.eql(undefined);
      const msg = 'Variable "$input" got invalid value "a"; Expected type CrJSON; Value is not a valid JSON';
      expect(result.errors![0].message).to.eql(msg);
      expect(value).to.eql(undefined);
    });
  });

  /*
  describe('parseLiteral', () => {
    it('valid date', async () => {
      const date = new Date(2018, 9, 12, 5, 20);
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrTimestamp,
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
      const result = await graphql(schema, `{ query(input: ${date.getTime()}) }`);
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.instanceof(Date);
      expect(value).to.eql(date);
    });

    it('invalid date', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrTimestamp,
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
      const result = await graphql(schema, `{ query(input: a) }`);
      expect(result.data).to.eql(undefined);
      const msg = 'Expected type CrTimestamp, found a; Can only parse numbers but got a: EnumValue';
      expect(result.errors![0].message).to.eql(msg);
      expect(value).to.eql(undefined);
    });
  });
  */
});
