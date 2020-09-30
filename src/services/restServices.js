export const GET_MESSAGEFILTER = "getMessageFilter";
export const GET_NOTIFICATIONMESSAGE = "getDistinctNotFilteredMessageSender";
export const LIST_MESSAGES = "listMessages";
export const LOGIN = "login";
export const DELETE_MESSAGEFILTER = "deleteMessageFilter";
export const ADD_MESSAGEFILTER = "addMessageFilter";

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

let login = function() {
  let r = serviceDefinitionPOST(LOGIN);
  r.baseUrl = getConfiguration().urlSecurity;
  return r;
};
const serviceConfiguration = {
  getMessageFilter: () => serviceDefinitionGET(GET_MESSAGEFILTER),
  getDistinctNotFilteredMessageSender: () => serviceDefinitionGET(GET_NOTIFICATIONMESSAGE),
  listMessages: () => serviceDefinitionGET(LIST_MESSAGES),
  addMessageFilter: () => serviceDefinitionPOST(ADD_MESSAGEFILTER),
  deleteMessageFilter: () => serviceDefinitionPOST(DELETE_MESSAGEFILTER),
  login,
};

export function getServiceInfo(serviceName) {
  let r = serviceConfiguration[serviceName];
  if (r === undefined) throw "Servizio " + serviceName + " non configurato!";
  return r();
}
