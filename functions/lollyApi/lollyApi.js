const { ApolloServer, gql } = require("apollo-server-lambda"),
  faunadb = require("faunadb"),
  axios = require("axios"),
  q = faunadb.query;

require("dotenv").config();

const Client = new faunadb.Client({
  // secret: "fnAD5uDay1ACBz6efQRmbEcRNMFwIv3meE4clE9j",
  secret: "fnAD52S1RaACB4gvp1m5GEnre2BevPY1tDf7tN94",

});

const typeDefs = gql`
  type Query {
    AllLollies: [Lolly]!
    GetLollyBySlug(slug: String!): Lolly
  }
  type Lolly {
    to: String!
    message: String!
    from: String!
    flavourTop: String!
    flavourMiddle: String!
    flavourBottom: String!
    slug: String!
  }
  type Mutation {
    craeteLolly(
      to: String!
      message: String!
      from: String!
      flavourTop: String!
      flavourMiddle: String!
      flavourBottom: String!
      slug: String!
    ): Lolly
  }
`;

const resolvers = {
  Query: {
    AllLollies: async () => {
      try {
        // const result = await Client.query(
        //   q.Map(
        //     q.Paginate(q.Match(q.Index("all_lollies"))),
        //     q.Lambda((lolly) => q.Get(lolly))
        //   )
        // );
        let result = await Client.query(
          q.Map(
            q.Paginate(q.Documents(q.Collection("lollies"))),
            q.Lambda(x => q.Get(x))
          )
        )
        return result.data.map((lolly) => {
          return {
            to: lolly.data.to,
            message: lolly.data.message,
            from: lolly.data.from,
            flavourTop: lolly.data.flavourTop,
            flavourMiddle: lolly.data.flavourMiddle,
            flavourBottom: lolly.data.flavourBottom,
            slug: lolly.data.slug,
          };
        });
      } catch (error) {
        return error.toString();
      }
    },
    GetLollyBySlug: async (_, { slug }) => {
      try {
        const result = await Client.query(
          q.Get(q.Match(q.Index("gte_lolly_by_slug"), slug))
        );
        return result.data;
      } catch (error) {
        return error.toString();
      }
    },
  },


Mutation: {
  craeteLolly: async (_, args) => {
    try {
      const result = await Client.query(
        q.Create(q.Collection("lollies"), {
          data: args,
        })
      )
      console.log(result.ref.id)
      return result.data
    } catch (error) {
      return error.toString()
    }
  },
},
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
});

exports.handler = server.createHandler();
