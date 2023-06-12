import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { context } from "./context";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";

// 1
import { schema } from "./schema";
export const server = new ApolloServer({
  schema,
  context,
  //plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  introspection: true, // 1
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
});

const port = process.env.PORT || 3000;   
// 2
server.listen({ port }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
