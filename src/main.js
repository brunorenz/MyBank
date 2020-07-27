import Vue from "vue";
import App from "./App.vue";
import router from "./router";
//import CoreuiVue from "@coreui/vue";
import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";
import "./registerServiceWorker";

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.use(require('vue-moment'));
//Vue.use(CoreuiVue);
Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
