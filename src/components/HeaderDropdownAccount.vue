<template>
  <!--<b-navbar-nav class="d-md-down-none"> -->
  <b-navbar-nav>
    <b-nav-item-dropdown split no-caret>
      <template slot="button-content">
        <img
          v-if="logoff"
          src="img/icons/user-off-2.png"
          class="img-avatar"
          alt="NotLogged"
        />
        <img
          v-if="!logoff"
          src="img/icons/user-on-2.png"
          class="img-avatar"
          alt="Logged"
        />
      </template>
      <b-dropdown-item :disabled="logoff"
        ><i class="fa fa-wrench" /> Impostazioni</b-dropdown-item
      >
      <b-dropdown-item-button @click="doLogoff()" v-if="!logoff"
        ><i class="fa fa-lock" /> Logout</b-dropdown-item-button
      >
      <b-dropdown-item v-if="logoff" to="/login"
        ><i class="fa fa-lock" /> Login</b-dropdown-item
      >
    </b-nav-item-dropdown>
  </b-navbar-nav>
</template>

<script>
import { isUserLogged, doLogoff } from "@/services/config";

export default {
  name: "HeaderDropdownAccount",
  data: () => {
    return { logoff: false };
  },
  mounted: function() {
    this.$root.$on("bv::dropdown::show", (bvEvent) => {
      this.checkLogonStatus();
    });
    this.$root.$on("MyBankLogon", (text) => {
      this.checkLogonStatus();
    });
    this.checkLogonStatus();
  },
  methods: {
    checkLogonStatus() {
      let logoff = !isUserLogged();
      console.log("Logon status : " + logoff);
      this.logoff = logoff;
    },
    doLogoff() {
      console.log("Do logoff!");
      doLogoff();
      this.$root.$emit("MyBankLogon", "logon");
    },
  },
};
</script>
