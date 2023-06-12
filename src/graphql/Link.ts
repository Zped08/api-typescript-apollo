import {
  objectType,
  extendType,
  nonNull,
  stringArg,
  intArg,
  inputObjectType,
  enumType,
  arg,
  list,
} from "nexus";
import { Prisma } from "@prisma/client";
import { NexusGenObjects } from "../../nexus-typegen";

export const Feed = objectType({
  name: "Feed",
  definition(t) {
    t.nonNull.list.nonNull.field("links", { type: Link }); // 1
    t.nonNull.int("count"); // 2
    t.id("id"); // 3
  },
});

export const Link = objectType({
  name: "Link", // 1
  definition(t) {
    // 2
    t.nonNull.int("id"); // 3
    t.nonNull.string("description"); // 4
    t.nonNull.string("url"); // 5
    t.nonNull.dateTime("createdAt");
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
    t.nonNull.field("feed", {
      // 1
      type: "Feed",
      args: {
        filter: stringArg(), // 1
        skip: intArg(), // 1
        take: intArg(), // 1
        orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }), // 1
      },
      async resolve(parent, args, context, info) {
        const where = args.filter // 2
          ? {
              OR: [
                { description: { contains: args.filter } },
                { url: { contains: args.filter } },
              ],
            }
          : {};
        /*         return context.prisma.link.findMany({
          where,
          skip: args?.skip as number | undefined, // 2
          take: args?.take as number | undefined, // 2
          orderBy: args?.orderBy as
            | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
            | undefined, // 2
        }); */
        const links = await context.prisma.link.findMany({
          where,
          skip: args?.skip as number | undefined,
          take: args?.take as number | undefined,
          orderBy: args?.orderBy as
            | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
            | undefined,
        });

        const count = await context.prisma.link.count({ where }); // 2
        const id = `main-feed:${JSON.stringify(args)}`; // 3

        return {
          // 4
          links,
          count,
          id,
        };
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

export const LinkOrderByInput = inputObjectType({
  name: "LinkOrderByInput",
  definition(t) {
    t.field("description", { type: Sort });
    t.field("url", { type: Sort });
    t.field("createdAt", { type: Sort });
  },
});

export const Sort = enumType({
  name: "Sort",
  members: ["asc", "desc"],
});
