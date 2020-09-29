import axios from "axios";
import { doLogoff } from "@/services/security";

import router from "@/router";
import store from "@/store";

export const GET_MESSAGEFILTER = "getMessageFilter";
export const DELETE_MESSAGEFILTER = "deleteMessageFilter";
export const GET_NOTIFICATIONMESSAGE = "getDistinctRegisteredMessage";
export const ADD_MESSAGEFILTER = "addMessageFilter";
export const LIST_MESSAGES = "listMessages";
export const ANALIZE_MESSAGES = "analizeMessages";
export const LIST_MOVEMENTS = "listAccountMovements";
export const GET_RULES = "getMessageRule";
const DELETE_RULE = "deleteMessageRule";
export const UPDATE_RULE = "updateMessageRule";
export const ADD_RULE = "addMessageRule";
export const TEST_RULE = "testMessageRule";
export const GET_CONFIGURATION = "getMyBankConfiguration";
//

export const LOGIN = "login";

const local = false;

export let validateRequest = function(serviceContext) {};

// Add a response interceptor
axios.interceptors.response.use(
  function(response) {
    if (typeof response.data.error != "undefined") {
      console.log(
        "Return code : " +
          response.data.error.code +
          " , Message : " +
          response.data.error.message
      );
    }
    return response;
  },
  function(error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    let a = error;
    if (
      typeof error.response != "undefined" &&
      typeof error.response.status != "undefined" &&
      error.response.status === 403
    ) {
      doLogoff();
      router.push("/login");
    }
    return Promise.reject(error);
  }
);
