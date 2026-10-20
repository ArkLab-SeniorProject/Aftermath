import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

function getGraphQLEndpoint(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:7071/graphql';
    }
    if (host.includes('dev-intheaftermath')) {
      return import.meta.env.VITE_GRAPHQL_URL_DEV || 'https://dev-aftermath-data-access.vercel.app/graphql';
    }
  }

  return import.meta.env.VITE_GRAPHQL_URL || 'https://aftermath-data-access.vercel.app/graphql';
}

const httpLink = new HttpLink({
  uri: getGraphQLEndpoint(),
  credentials: 'include',
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
