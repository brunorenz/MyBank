import axios from "axios";
import {
  getConfiguration,
  SecurityConfiguration,
  doLogoff,
  getXrfToken,
} from "@/services/config";

import router from "@/router";

const GET_MESSAGEFILTER = "getMessageFilter";
const DELETE_MESSAGEFILTER = "deleteMessageFilter";
const GET_NOTIFICATIONMESSAGE = "getDistinctRegisteredMessage";
const ADD_MESSAGEFILTER = "addMessageFilter";
const LIST_MESSAGES = "listMessages";
const ANALIZE_MESSAGES = "analizeMessages";
const LIST_MOVEMENTS = "listAccountMovements";
const GET_RULES = "getMessageRule";
const DELETE_RULE = "deleteMessageRule";
const UPDATE_RULE = "updateMessageRule";
const ADD_RULE = "addMessageRule";
const TEST_RULE = "testMessageRule";
const GET_ACCOUNTS = "getAccounts";
//

const LOGIN = "login";

const local = false;

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

export default class HttpMonitor {
  constructor() {
    this.configuration = getConfiguration();
  }

  getPostJsonSecurityHeader(auth) {
    let headers = {
      "Content-Type": "application/json; charset=utf-8",
    };
    if (typeof auth === "undefined") auth = true;
    return this.getSecurityHeader(headers, auth);
  }

  getPostSecurityHeader(auth) {
    let headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    };
    if (typeof auth === "undefined") auth = true;
    return this.getSecurityHeader(headers, auth);
  }
  getSecurityHeader(headers, auth) {
    if (typeof headers === "undefined") headers = {};
    if (SecurityConfiguration.basicAuthRequired) {
      headers.Authorization = SecurityConfiguration.basicAuth;
    }
    if (typeof auth === "undefined") auth = false;
    if (SecurityConfiguration.jwtRequired && auth) {
      //let token = window.sessionStorage.getItem("jwttoken");
      let token = getXrfToken();
      if (token == null) {
        //let a = router;
        router.push("/login");
        throw new Error("No security record found!");
      } else headers.JWTToken = token;
    }
    return headers;
  }
  getUrl(functionUrl, queryParams) {
    var outUrl = this.configuration.serverUrl + functionUrl;
    if (queryParams && queryParams.length > 0) {
      outUrl += "?";
      for (var index = 0; index < queryParams.length; index++)
        if (index == 0)
          outUrl += queryParams[index].key + "=" + queryParams[index].value;
        else
          outUrl +=
            "&" + queryParams[index].key + "=" + queryParams[index].value;
    }
    console.log("Call " + outUrl);
    return outUrl;
  }
  /**
   * Login
   * @param {*} email
   * @param {*} password
   */
  login(email, password) {
    let inputData = {
      email: email,
      password: password,
    };
    let url = this.getUrl(LOGIN);
    return axios.post(url, "data=" + JSON.stringify(inputData), {
      headers: this.getPostSecurityHeader(false),
    });
  }

  // getWeatherInfo() {
  //   let url = this.configuration.weatherMonitor.weatherUrl;
  //   url = url + "&id=" + this.configuration.weatherMonitor.id;
  //   console.log("Call " + url);
  //   return axios.get(url, {});
  // }

  /**
   * Get message filter by type
   *
   * @param {*} type
   */
  getMessageFilter(type) {
    var queryParams = [];
    if (type) {
      queryParams.push({ key: "type", value: type });
    }
    return axios.get(this.getUrl(GET_MESSAGEFILTER, queryParams), {
      headers: this.getSecurityHeader(),
    });
  }

  /**
   * Analize message
   * @param {*} msgIds
   */
  analizeMessages(msgIds) {
    let url = this.getUrl(ANALIZE_MESSAGES);
    return axios.post(url, JSON.stringify(msgIds), {
      headers: this.getPostJsonSecurityHeader(),
    });
  }

  getAccounts() {
    var queryParams = [];
    return axios.get(this.getUrl(GET_ACCOUNTS, queryParams), {
      headers: this.getSecurityHeader(),
    });
  }
  updateMessageRule(rule) {
    let url = this.getUrl(
      typeof rule._id === "undefined" ? ADD_RULE : UPDATE_RULE
    );
    return axios.post(url, JSON.stringify(rule), {
      headers: this.getPostJsonSecurityHeader(),
    });
  }

  testMessageRule(rule, message) {
    let url = this.getUrl(TEST_RULE);
    let input = {
      rule: rule,
      message: message,
    };
    return axios.post(url, JSON.stringify(input), {
      headers: this.getPostJsonSecurityHeader(),
    });
  }
  /**
   * get account movements
   * @param {*} filter
   */
  listAccountMovements(filter) {
    let url = this.getUrl(LIST_MOVEMENTS);
    return axios.post(url, JSON.stringify(filter), {
      headers: this.getPostJsonSecurityHeader(),
    });
  }

  getMessageRuleById(idRule, idMessage) {
    var queryParams = [];
    if (typeof idRule != "undefined" && idRule != null)
      queryParams.push({ key: "idRule", value: idRule });
    else if (typeof idMessage != "undefined" && idMessage != null)
      queryParams.push({ key: "idMessage", value: idMessage });
    return axios.get(this.getUrl(GET_RULES, queryParams), {
      headers: this.getSecurityHeader(),
    });
  }
  getMessageRule(type, key, key2) {
    var queryParams = [{ key: "type", value: type }];
    if (typeof key != "undefined") {
      queryParams.push({ key: "key", value: key });
      if (typeof key2 != "undefined")
        queryParams.push({ key: "key2", value: key2 });
    }
    return axios.get(this.getUrl(GET_RULES, queryParams), {
      headers: this.getSecurityHeader(),
    });
  }

  listMessages(type, key) {
    var queryParams = [{ key: "type", value: type }];
    queryParams.push({
      key: type === "SMS" ? "sender" : "packageName",
      value: key,
    });

    return axios.get(this.getUrl(LIST_MESSAGES, queryParams), {
      headers: this.getSecurityHeader(),
    });
  }
  getNotificationMessage(type) {
    var queryParams = [];
    if (type) {
      queryParams.push({ key: "type", value: type });
    }
    return axios.get(this.getUrl(GET_NOTIFICATIONMESSAGE, queryParams), {
      headers: this.getSecurityHeader(),
    });
  }
  /**
   *
   * @param {*} inputData
   */
  deleteMessageFilter(inputData) {
    let url = this.getUrl(DELETE_MESSAGEFILTER);
    return axios.post(url, JSON.stringify(inputData), {
      headers: this.getPostJsonSecurityHeader(),
    });
  }

  addMessageFilter(inputData) {
    let url = this.getUrl(ADD_MESSAGEFILTER);
    return axios.post(url, JSON.stringify(inputData), {
      headers: this.getPostJsonSecurityHeader(),
    });
  }
}
