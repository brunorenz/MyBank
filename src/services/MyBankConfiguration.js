const { default: store } = require("../store");

const { default: HttpManager } = require("./HttpManager");

const { GET_CONFIGURATION, getServiceInfo } = require("./restServices");

let getMyBankConfiguration = async function() {
  let mybankCfg = store.getters.session("mybankCfg");
  if (mybankCfg && mybankCfg.accounts != undefined) return mybankCfg;
  const httpService = new HttpManager();
  let info = getServiceInfo(GET_CONFIGURATION);
  let resp = await httpService.callAsyncNodeServer(info);
  var data = resp.data;
  let esito = data.error;
  if (esito.code === 0) {
    let d = data.data;
    let ac = {};
    for (let ix = 0; ix < d.accounts.length; ix++) {
      ac[d.accounts[ix].bankKey] = d.accounts[ix];
    }
    let ca = {};
    for (let ix = 0; ix < d.categories.length; ix++) {
      ca[d.categories[ix].category] = d.categories[ix];
    }
    let mv = {};
    for (let ix = 0; ix < d.movementType.length; ix++) {
      mv[d.movementType[ix].type] = d.movementType[ix];
    }
    let mybankCfg = {
      accounts: ac,
      categories: ca,
      movementType: mv,
    };
    store.commit("updateKeySession", {
      key: "mybankCfg",
      value: mybankCfg,
    });
    return mybankCfg;
  }
  return undefined;

  //return httpService.callAsyncNodeServer(info);
  /*
  console.log("RES");
  return response;
  /*
  httpService
    .callNodeServer(info)
    .then((response) => {
      var data = response.data;
      let esito = data.error;
      if (esito.code === 0) {
        let d = data.data;
        let ac = {};
        for (let ix = 0; ix < d.accounts.length; ix++) {
          ac[d.accounts[ix].bankKey] = d.accounts[ix];
        }
        let ca = {};
        for (let ix = 0; ix < d.categories.length; ix++) {
          ca[d.categories[ix].category] = d.categories[ix];
        }
        let mybankCfg = {
          accounts: ac,
          categories: ca,
        };
        store.commit("updateKeySession", { mybankCfg });
        return mybankCfg;
      }
    })
    .catch((error) => {
      console.log("MyBankGetConfiguration error", error);
      return null;
    });
    */
};

export default getMyBankConfiguration;
//exports.getMyBankConfiguration = getMyBankConfiguration;
