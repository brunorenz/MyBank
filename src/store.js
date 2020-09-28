import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);
const KEY_RISORSA = "VOLRIS";
const KEY_USER = "VOLUSER";

let cleanSessioneLocalStorage = function(key) {
  window.sessionStorage.setItem(key, {});
};

let salvaRisorsaLocalStorage = function(risorsa) {
  if (risorsa && risorsa.matricola) {
    let m = {
      matricola: risorsa.matricola,
      nomecognome: risorsa.nomecognome,
    };
    window.sessionStorage.setItem(KEY_RISORSA, JSON.stringify(m));
  }
};

let salvaAttributoLocalStorage = function(key, value) {
  let usr = recuperaSessioneLocalStorage(KEY_USER);
  usr[key] = value;
  window.sessionStorage.setItem(KEY_USER, JSON.stringify(usr));
};

let recuperaSessioneLocalStorage = function(key) {
  let s = window.sessionStorage.getItem(key);
  try {
    if (s != null) return JSON.parse(s);
  } catch (error) {
    console.log(error);
  }
  return {};
};

let store = new Vuex.Store({
  state: {
    datiSessione: undefined,
    errorMessage: undefined,
    componentName: undefined,
  },
  getters: {
    errorMessage: (state) => {
      return state.errorMessage;
    },
    lastComponent: (state) => {
      let componentName = undefined;
      let cn = state.componentName;
      if (cn === undefined)
        cn = recuperaSessioneLocalStorage(KEY_USER).componentName;
      if (cn === undefined) cn = [];
      let l = cn.length;
      if (l > 0) componentName = cn[l - 1];
      return componentName;
    },
    storage: (state) => (key) => {
      console.log("STATE : " + state);
      console.log("KEY   : " + key);
      let usr = recuperaSessioneLocalStorage(KEY_USER);
      return usr[key];
    },
    sessione: (state) => {
      let d = state.datiSessione;
      if (d === undefined) d = {};
      if (!d.risorsa.matricola) {
        // provo a recuparare da local Storage
        let ris = recuperaSessioneLocalStorage(KEY_RISORSA);
        d.risorsa.matricola = ris.matricola;
        d.risorsa.nomecognome = ris.nomecognome;
      }
      if (!d.ndgRicerca) {
        // provo a recuparare da local Storage
        let usr = recuperaSessioneLocalStorage(KEY_USER);
        d.ndgRicerca = usr.ndgRicerca;
      }
      return d;
    },
  },
  mutations: {
    previousComponent(state, componentName) {
      let cn = state.componentName;
      if (!cn) cn = recuperaSessioneLocalStorage(KEY_USER).componentName;
      if (!cn) cn = [];
      let l = cn.length;
      if (l > 0) {
        cn.splice(l - 1, 1);
        salvaAttributoLocalStorage("componentName", cn);
        state.componentName = cn;
      }
    },
    currentComponent(state, componentName) {
      let cn = state.componentName;
      if (!cn) cn = recuperaSessioneLocalStorage(KEY_USER).componentName;
      if (!cn) cn = [];
      let l = cn.length;
      if (l === 0 || cn[l - 1] != componentName) {
        cn.push(componentName);
        salvaAttributoLocalStorage("componentName", cn);
        state.componentName = cn;
      }
    },

    cleanSessione(state) {
      cleanSessioneLocalStorage(KEY_RISORSA);
      state.datiSessione = {};
    },

    updateKeyStorage(state, { key, value }) {
      if (key) salvaAttributoLocalStorage(key, value);
    },

    updateKeySessione(state, { key, value }) {
      if (state.datiSessione && key) {
        state.datiSessione[key] = value;
      }
    },

    updateSessione(state, datiSessione) {
      if (datiSessione.risorsa && datiSessione.risorsa.matricola)
        salvaRisorsaLocalStorage(datiSessione.risorsa);
      if (datiSessione.ndgRicerca)
        salvaAttributoLocalStorage("ndgRicerca", datiSessione.ndgRicerca);
      state.datiSessione = datiSessione;
    },
    errorMessage(state, errorMessage) {
      state.errorMessage = errorMessage;
    },
  },
  actions: {},
});

export default store;
