import { apiSlice } from '../../api/apiSlice';

export const friendshipApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendFriendRequest: builder.mutation({
      query: (receiveNickname) => ({
        url: 'friendship/request',
        method: 'POST',
        body: { nickname: receiveNickname },
      }),
      invalidatesTags: ['Friendship'],
    }),
    acceptFriendRequest: builder.mutation({
      query: (friendshipId) => ({
        url: `friendship/accept/${friendshipId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Friendship'], 
    }),
    getFriendsList: builder.query<any, void>({
      query: () => 'friendship/list',
      providesTags: ['Friendship'],
    }),

    receivedList: builder.query<any, void>({
      query: () => 'friendship/received',
      providesTags: ['Friendship']
    }),

    sentList: builder.query<any, void>({
      query: () => 'friendship/sent',
      providesTags: ['Friendship']
    }),
  }),
});

export const {
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useGetFriendsListQuery,
  useReceivedListQuery,
  useSentListQuery,
} = friendshipApi;