// src/features/auth/authApi.js
import { apiSlice } from '../../api/apiSlice';
import { setCredentials } from './authSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (credentials) => ({
        url: 'auth/signup',
        method: 'POST',
        body: credentials,
      }),
      // No need for onQueryStarted here unless you want to log in immediately after signup
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      // Custom logic to handle the token and update the local auth state
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // data contains { access_token: string }
          dispatch(setCredentials(data));
        } catch (error) {
          // Handle error (e.g., dispatch an error action, logging)
          console.error('Login failed:', error);
        }
      },
      // Invalidate User tag on successful login
      invalidatesTags: ['User'], 
    }),
  }),
});

export const { useSignupMutation, useLoginMutation } = authApi;