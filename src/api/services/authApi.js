import { baseApi } from '../baseApi';
import { getNodeBackendUrl } from '../services NodeJs/nodeBackendConfig';

const safeJsonResponseHandler = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (_) {
    return {
      status: 'false',
      message: `Non-JSON response received (HTTP ${response.status})`,
      raw: text.slice(0, 300),
    };
  }
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Verify user by phone number
    verifyUser: builder.mutation({
      query: (phoneNumber) => ({
        url: 'check_mobile_no_availability_all',
        method: 'POST',
        body: { mobile_no: phoneNumber },
        responseHandler: safeJsonResponseHandler,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Login user
    loginUser: builder.mutation({
      query: (phoneNumber) => ({
        url: 'login',
        method: 'POST',
        body: { mobile_no: phoneNumber },
        responseHandler: safeJsonResponseHandler,
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
        responseHandler: safeJsonResponseHandler,
      }),
    }),

    // Send custom message
    sendMessage: builder.mutation({
      async queryFn({ mobile_no, content }) {
        try {
          const response = await fetch(`${getNodeBackendUrl()}/api/public/send-otp-textware`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile_no, content }),
          });
          const data = await safeJsonResponseHandler(response);
          if (!response.ok || data?.status === false) {
            return { error: { status: response.status, data } };
          }
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', data: { message: error?.message || 'Failed to send message' } } };
        }
      },
    }),
  }),
});

export const {
  useVerifyUserMutation,
  useLoginUserMutation,
  useSendOTPMutation,
  useSendMessageMutation,
} = authApi;

