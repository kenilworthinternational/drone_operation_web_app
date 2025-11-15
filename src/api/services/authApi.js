import { baseApi } from '../baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Verify user by phone number
    verifyUser: builder.mutation({
      query: (phoneNumber) => ({
        url: 'check_mobile_no_availability_all',
        method: 'POST',
        body: { mobile_no: phoneNumber },
      }),
      invalidatesTags: ['Auth'],
    }),

    // Login user
    loginUser: builder.mutation({
      query: (phoneNumber) => ({
        url: 'login',
        method: 'POST',
        body: { mobile_no: phoneNumber },
      }),
      invalidatesTags: ['Auth'],
    }),

    // Send OTP
    sendOTP: builder.mutation({
      query: ({ mobile_no, otp }) => ({
        url: 'send_sms_with_custom_body',
        method: 'POST',
        body: {
          mobile_no,
          content: `Your OTP for Drone Services Management System login is: ${otp}. Please do not share this code with anyone.`
        },
      }),
    }),

    // Send custom message
    sendMessage: builder.mutation({
      query: ({ mobile_no, content }) => ({
        url: 'send_sms_with_custom_body',
        method: 'POST',
        body: { mobile_no, content },
      }),
    }),
  }),
});

export const {
  useVerifyUserMutation,
  useLoginUserMutation,
  useSendOTPMutation,
  useSendMessageMutation,
} = authApi;

