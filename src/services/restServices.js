export const GET_MESSAGEFILTER = "getMessageFilter";
export const GET_NOTIFICATIONMESSAGE = "getDistinctNotFilteredMessageSender";
export const LOGIN = "login";
const DELETE_MESSAGEFILTER = "deleteMessageFilter";
const ADD_MESSAGEFILTER = "addMessageFilter";
const LIST_MESSAGES = "listMessages";
const ANALIZE_MESSAGES = "analizeMessages";
const LIST_MOVEMENTS = "listAccountMovements";
const GET_RULES = "getMessageRule";
const DELETE_RULE = "deleteMessageRule";
const UPDATE_RULE = "updateMessageRule";
const ADD_RULE = "addMessageRule";
const TEST_RULE = "testMessageRule";
const GET_CONFIGURATION = "getMyBankConfiguration";

import { getConfiguration } from "@/services/config";

let serviceDefinitionPOST = function(url) {
  return {
    request: {},
    url: "p/" + url,
    method: "POST",
  };
};

let serviceDefinitionGET = function(url) {
  return {
    query: {},
    url: "g/" + url,
    method: "GET",
  };
};

let getMessageFilter = function() {
  return serviceDefinitionGET(GET_MESSAGEFILTER);
};
let getDistinctNotFilteredMessageSender = function() {
  return serviceDefinitionGET(GET_NOTIFICATIONMESSAGE);
};
let login = function() {
  let r = serviceDefinitionPOST(LOGIN);
  r.baseUrl = getConfiguration().urlSecurity;
  return r;
};
const serviceConfiguration = {
  getMessageFilter,
  getDistinctNotFilteredMessageSender,
  login,
};

export function getServiceInfo(serviceName) {
  let r = serviceConfiguration[serviceName];
  if (r === undefined) throw "Servizio " + serviceName + " non configurato!";
  return r();
}
