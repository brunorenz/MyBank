import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

const KEY_USER = "MBUSER";

let cleanLocalStorage = function(key) {
  window.sessionStorage.setItem(key, {});
};

let recuperaLocalStorage = function(key) {
  let s = window.sessionStorage.getItem(key);
  try {
    if (s != null) return JSON.parse(s);
  } catch (error) {
    console.log(error);
  }
  return {};
};

let salvaAttributoLocalStorage = function(key, value) {
  let usr = recuperaLocalStorage(KEY_USER);
  usr[key] = value;
  window.sessionStorage.setItem(KEY_USER, JSON.stringify(usr));
};
// https://stackoverflow.com/questions/50125249/vuex-computed-properties-are-not-reactive
let store = new Vuex.Store({
  state: {
    datiSessione: undefined,
    datiStorage: undefined,
    errorMessage: undefined,
  },
  getters: {
    errorMessage: (state) => {
      return state.errorMessage;
    },

    storage: (state) => (key) => {
      let d = state.datiStorage;
      if (d === undefined) d = {};
      if (d[key] == undefined) {
        let usr = recuperaLocalStorage(KEY_USER);
        return usr[key];
      }
      return d[key];
    },
    sessione: (state) => (key) => {
      let d = state.datiSessione;
      if (d === undefined) d = {};
      return d[key];
    },
  },
  mutations: {
    cleanSessione(state) {
      state.datiSessione = {};
      state.datiStorage = {};
      cleanLocalStorage(KEY_USER);
    },

    updateKeyStorage(state, { key, value }) {
      let s = state.datiStorage;
      if (s === undefined) s = {};
      if (key) {
        s[key] = value;
        salvaAttributoLocalStorage(key, value);
        Vue.set(state, "datiStorage", s);
      }
    },

    updateKeySessione(state, { key, value }) {
      if (state.datiSessione === undefined) state.datiSessione = {};
      if (key) {
        state.datiSessione[key] = value;
      }
    },

    errorMessage(state, errorMessage) {
      state.errorMessage = errorMessage;
    },
  },
  actions: {},
});

export default store;
