import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const getAuthToken = () => localStorage.getItem('accessToken');

// Event to notify about session expiration
export const sessionExpiredEvent = new EventTarget();

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => { 
      const token = getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });

  const result = await baseQuery(args, api, extraOptions);

  // Check if we got a 401 Unauthorized response
  if (result.error && result.error.status === 401) {
    // Dispatch a custom event to notify the app about session expiration
    sessionExpiredEvent.dispatchEvent(new Event('sessionExpired'));
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['User', 'Friendship', 'Conversation', 'Message'],
  endpoints: (builder) => ({
    getPlaceholder: builder.query({ 
      query: () => 'placeholder',
    }),
  }),
});

export const { useGetPlaceholderQuery } = apiSlice;