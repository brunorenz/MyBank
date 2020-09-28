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

let configuration = {
  serverUrl: process.env.NODE_ENV === "production" ? serverUrlP : serverUrlD,
  urlApp: urlApp,
  urlSecurity: urlSecurity,
  weatherMonitor: {
    weatherUrl: weatherUrl,
    id: 3182351,
    timeout: 60000,
  },
};

export function getConfiguration() {
  return JSON.parse(JSON.stringify(configuration));
}
