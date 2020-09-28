export const GET_MESSAGEFILTER = "getMessageFilter";
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
const GET_CONFIGURATION = "getMyBankConfiguration";

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
const serviceConfiguration = {
  getMessageFilter,
};

export function getServiceInfo(serviceName) {
  let r = serviceConfiguration[serviceName];
  if (r === undefined) throw "Servizio " + serviceName + " non configurato!";
  //   let res = r();
  //   if (res.method === "POST") {
  //     res.request = {};
  //   } else {
  //     res.query = {};
  //   }
  return r();
}
