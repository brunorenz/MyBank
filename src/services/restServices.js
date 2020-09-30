export const GET_MESSAGEFILTER = "getMessageFilter";
export const GET_NOTIFICATIONMESSAGE = "getDistinctNotFilteredMessageSender";
export const LIST_MESSAGES = "listMessages";
export const LOGIN = "login";
export const DELETE_MESSAGEFILTER = "deleteMessageFilter";
export const ADD_MESSAGEFILTER = "addMessageFilter";
export const LIST_MOVEMENTS = "listAccountMovements";
export const ANALIZE_MESSAGES = "analizeMessages";
export const GET_RULES = "getMessageRule";
export const GET_CONFIGURATION = "getMyBankConfiguration";
const DELETE_RULE = "deleteMessageRule";
export const UPDATE_RULE = "updateMessageRule";
export const ADD_RULE = "addMessageRule";
export const TEST_RULE = "testMessageRule";

const METHOD = { POST: 1, GET: 2 };
import { getConfiguration } from "@/services/config";

let serviceDefinition = function(url, method) {
  return method === METHOD.POST ? serviceDefinitionPOST(url) : serviceDefinitionGET(url);
};

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
  getMessageFilter: () => serviceDefinition(GET_MESSAGEFILTER, METHOD.GET),
  getDistinctNotFilteredMessageSender: () => serviceDefinition(GET_NOTIFICATIONMESSAGE, METHOD.GET),
  listMessages: () => serviceDefinition(LIST_MESSAGES, METHOD.GET),
  addMessageFilter: () => serviceDefinition(ADD_MESSAGEFILTER, METHOD.POST),
  deleteMessageFilter: () => serviceDefinition(DELETE_MESSAGEFILTER, METHOD.POST),
  listAccountMovements: () => serviceDefinition(LIST_MOVEMENTS, METHOD.POST),
  analizeMessages: () => serviceDefinition(ANALIZE_MESSAGES, METHOD.POST),
  getMessageRule: () => serviceDefinition(GET_RULES, METHOD.GET),
  getMyBankConfiguration: () => serviceDefinition(GET_CONFIGURATION, METHOD.GET),
  testMessageRule: () => serviceDefinition(TEST_RULE, METHOD.POST),
  updateMessageRule: () => serviceDefinition(UPDATE_RULE, METHOD.POST),
  addMessageRule: () => serviceDefinition(ADD_RULE, METHOD.POST),
  login,
};

export function getServiceInfo(serviceName) {
  let r = serviceConfiguration[serviceName];
  if (r === undefined) throw "Servizio " + serviceName + " non configurato!";
  return r();
}
