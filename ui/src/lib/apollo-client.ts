import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

function getGraphQLEndpoint(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:7071/graphql';
    }
    if (host.includes('dev-intheaftermath')) {
      return (
        import.meta.env.VITE_GRAPHQL_URL_DEV ||
        'https://dev-aftermath-data-access.vercel.app/graphql'
      );
    }
  }

  return import.meta.env.VITE_GRAPHQL_URL || 'https://aftermath-data-access.vercel.app/graphql';
}

const httpLink = new HttpLink({
  uri: getGraphQLEndpoint(),
  credentials: 'include',
});

function isSignedAuthToken(token: string | null): token is string {
  return token !== null && token.split('.').length === 3;
}

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    headers: {
      ...headers,
      ...(isSignedAuthToken(token) ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
