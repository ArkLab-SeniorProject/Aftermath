import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApolloServer } from '@apollo/server';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { ObjectId } from 'mongodb';
import { verifyAuthToken } from './auth.js';
import { getDb } from './db/mongo-client.js';
import { resolvers } from './graphql/resolvers/index.js';
import { typeDefs } from './graphql/schema/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
  dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
}

export type GraphQLContext = {
  mongoDb: Awaited<ReturnType<typeof getDb>>;
  userId?: string;
  role?: string;
};

let server: ApolloServer<GraphQLContext> | null = null;

export async function createApolloServer(): Promise<ApolloServer<GraphQLContext>> {
  if (server) {
    return server;
  }

  const newServer = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    introspection: true,
  });

  await newServer.start();
  server = newServer;
  return server;
}

export async function createContext(req?: express.Request): Promise<GraphQLContext> {
  const authorization = req?.headers?.authorization?.trim();
  let userId: string | undefined;
  if (authorization) {
    const match = /^Bearer\s+(\S+)$/.exec(authorization);
    if (!match) {
      throw new Error('Invalid authorization header');
    }
    userId = verifyAuthToken(match[1]);
  }

  const mongoDb = await getDb();
  let role: string | undefined;
  if (userId) {
    const user = await mongoDb.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error('Invalid or expired authentication token');
    }
    role = typeof user.role === 'string' ? user.role : 'user';
  }
  return { mongoDb, userId, role };
}

function parseGraphQLRequest(req: express.Request) {
  if (req.method === 'POST') {
    return req.body ?? {};
  }

  if (req.method === 'GET') {
    const { query, variables, operationName } = req.query;
    return {
      query: typeof query === 'string' ? query : undefined,
      variables: typeof variables === 'string' ? JSON.parse(variables) : undefined,
      operationName: typeof operationName === 'string' ? operationName : undefined,
    };
  }

  return {};
}

function isLocalRequest(req: express.Request): boolean {
  // Never serve the landing page on Vercel-hosted deployments.
  if (process.env.VERCEL) {
    return false;
  }

  const host = (req.get('host') ?? '').toLowerCase();
  const forwardedHost = (req.get('x-forwarded-host') ?? '').toLowerCase();
  const localHosts = ['localhost', '127.0.0.1', '[::1]'];

  return localHosts.some(
    (h) =>
      host === h ||
      host.startsWith(`${h}:`) ||
      forwardedHost === h ||
      forwardedHost.startsWith(`${h}:`)
  );
}

const graphqlHandler: express.RequestHandler = async (req, res) => {
  try {
    const { query, variables, operationName } = parseGraphQLRequest(req);

    if (!query || typeof query !== 'string') {
      res.status(400).json({ errors: [{ message: 'Must provide query string.' }] });
      return;
    }

    const apolloServer = await createApolloServer();
    const result = await apolloServer.executeOperation(
      { query, variables, operationName },
      { contextValue: await createContext(req) }
    );

    if (result.body.kind === 'single') {
      res.status(200).json(result.body.singleResult);
    } else {
      res.status(500).json({ errors: [{ message: 'Incremental responses are not supported.' }] });
    }
  } catch (err: any) {
    console.error('[graphqlHandler] error:', err);
    if (!res.headersSent) {
      res.status(500).json({ errors: [{ message: err.message ?? 'Internal server error' }] });
    }
  }
};

export function createGraphQLApp(): express.Express {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get('/graphql', async (req, res, next) => {
    // Allow GET queries (e.g. ?query={__typename}) to pass through to the GraphQL handler.
    if (req.query.query) {
      next();
      return;
    }

    // Use the official Apollo landing page. Sandbox is only for localhost;
    // hosted deployments get the "use POST" landing page.
    const landingPlugin = isLocalRequest(req)
      ? ApolloServerPluginLandingPageLocalDefault()
      : ApolloServerPluginLandingPageProductionDefault();

    try {
      const serverWillStart = await (landingPlugin as any).serverWillStart({
        apollo: { gateway: undefined, config: {}, logger: console },
      });
      const landingPage = await serverWillStart.renderLandingPage();
      const html = await landingPage.html();
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } catch (err: any) {
      console.error('[landing page] error:', err);
      res.setHeader('Content-Type', 'text/html');
      res
        .status(500)
        .send('<!DOCTYPE html><html><body>Failed to load Apollo landing page</body></html>');
    }
  });

  app.use('/graphql', graphqlHandler);
  app.use('/', graphqlHandler);
  return app;
}
