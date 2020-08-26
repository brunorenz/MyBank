//import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";

const local = true;
const remoteNodeServer = true;
const urlApp = "mybank/rest/";
const urlSecurity = "security/rest/";
// const serverUrlP = "/mybank/rest/";
// const serverUrlRemote = remoteNodeServer
//   ? "https://mybank.65bruno.it/mybank/rest/"
//   : "http://192.168.0.101:8102/mybank/rest/";
// const serverUrlD = local
//   ? "http://localhost:8102/mybank/rest/"
//   : serverUrlRemote;
const serverUrlP = "/";
const serverUrlRemote = remoteNodeServer
  ? "https://mybank.65bruno.it/"
  : "http://192.168.0.101:8102/";
const serverUrlD = local ? "http://localhost:8102/" : serverUrlRemote;

const weatherUrl =
  "https://api.openweathermap.org/data/2.5/weather?lang=it&units=metric&APPID=2c5c4639e9d55c06402b4396433a5944";
// Definizione regole

// let ruleDefinitions = [
//   {
//     key: "DATA",
//     exist: false,
//     type: "data",
//     pattern: true,
//   },
//   {
//     key: "IMPORTO",
//     exist: false,
//     type: "number",
//     pattern: false,
//   },
//   {
//     key: "CONTO",
//     exist: false,
//     pattern: false,
//   },
//   {
//     key: "ESERCENTE",
//     exist: false,
//     pattern: false,
//   },
//   {
//     key: "BANCOMAT",
//     exist: true,
//     pattern: false,
//   },
//   {
//     key: "POS",
//     exist: true,
//     pattern: false,
//   },
//   {
//     key: "CARTACREDITO",
//     exist: true,
//     pattern: false,
//   },
// ];

let configuration = {
  serverUrl: process.env.NODE_ENV === "production" ? serverUrlP : serverUrlD,
  urlApp: urlApp,
  urlSecurity: urlSecurity,
  weatherMonitor: {
    weatherUrl: weatherUrl,
    id: 3182351,
    timeout: 60000,
  },
  //ruleDefinitions: ruleDefinitions,
};

export function getConfiguration() {
  return JSON.parse(JSON.stringify(configuration));
}

//https://code.tutsplus.com/it/tutorials/getting-started-with-chartjs-line-and-bar-charts--cms-28384
//

// export function checkSecurity(router) {
//   if (SecurityConfiguration.jwtRequired) {
//     let token = window.sessionStorage.getItem("jwttoken");
//     if (token == null) {
//       //let a = router;
//       router.push("/login");
//     }
//   }
// }
// // Definizioni da Server

// // Sicurezza
// export var SecurityConfiguration = {
//   basicAuth: "Basic YWRtaW46YWgwNjB2eUEu",
//   basicAuthRequired: true,
//   jwtRequired: true,
// };

// export function isUserLogged() {
//   return window.sessionStorage.getItem("jwt") != null;
// }

// export function doLogoff() {
//   window.sessionStorage.removeItem("jwttoken");
//   window.sessionStorage.removeItem("jwt");
// }

// export function getXrfToken() {
//   return window.sessionStorage.getItem("jwttoken");
// }
