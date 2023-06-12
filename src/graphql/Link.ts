import { objectType, extendType, nonNull, stringArg } from "nexus";
import { NexusGenObjects } from "../../nexus-typegen";

export const Link = objectType({
  name: "Link", // 1
  definition(t) {
    // 2
    t.nonNull.int("id"); // 3
    t.nonNull.string("description"); // 4
    t.nonNull.string("url"); // 5
    t.field("postedBy", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .postedBy();
      },
    });
    t.nonNull.list.nonNull.field("voters", {
      // 1
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .voters();
      },
    });
  },
});

/* let links: NexusGenObjects["Link"][] = [
  // 1
  {
    id: 1,
    url: "www.howtographql.com",
    description: "Fullstack tutorial for GraphQL",
  },
  {
    id: 2,
    url: "graphql.org",
    description: "GraphQL official website",
  },
]; */

export const LinkQuery = extendType({
  // 2
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      // 3
      type: "Link",
      resolve(parent, args, context, info) {
        // 4
        return context.prisma.link.findMany(); // 1
      },
    });
  },
});

export const LinkMutation = extendType({
  // 1
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      // 2
      type: "Link",
      args: {
        // 3
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },

      resolve(parent, args, context) {
        const { description, url } = args;
        const { userId } = context;

        if (!userId) {
          // 1
          throw new Error("Cannot post without logging in.");
        }

        const newLink = context.prisma.link.create({
          data: {
            description,
            url,
            postedBy: { connect: { id: userId } }, // 2
          },
        });

        return newLink;
      },
    });
  },
});
