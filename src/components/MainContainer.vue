<template>
  <div class="app">
    <AppHeader fixed>
      <b-link class="navbar-brand">
        <img
          class="navbar-brand-full"
          src="img/icons/iconfinder_walletmoneyshoppingatmcard_128.png"
          width="50"
          height="50"
          alt="MyBank"
        />
        <img
          class="navbar-brand-minimized"
          src="img/icons/iconfinder_walletmoneyshoppingatmcard_128.png"
          width="50"
          height="50"
          alt="MyBank"
        />
      </b-link>
      <SidebarToggler class="d-lg-none" display="md" mobile />
      <SidebarToggler
        class="d-md-down-none"
        display="lg"
        :defaultOpen="false"
      />
      <!-- <SidebarToggler mobile /> -->
      <b-navbar-nav class="d-md-down-none" v-if="isUserLogged">
        <b-nav-item class="px-3" to="/dashboard">Dashboard</b-nav-item>
        <b-nav-item-dropdown class="px-3" text="Configurazione">
          <b-dropdown-item to="/gestioneFiltri">Filtri</b-dropdown-item>
          <b-dropdown-item to="/gestioneMessaggi">Messaggi</b-dropdown-item>
          <b-dropdown-item to="/gestioneRegole">Regole</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item class="px-3" to="/gestioneMovimenti"
          >Gestione Movimenti</b-nav-item
        >
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto">
        <HeaderDropdownAccount />
      </b-navbar-nav>
    </AppHeader>
    <div class="app-body">
      <AppSidebar fixed>
        <SidebarHeader />
        <SidebarForm />
        <SidebarNav :navItems="isUserLogged ? navOn : navOff"></SidebarNav>
        <SidebarFooter />
        <SidebarMinimizer />
      </AppSidebar>
      <main class="main">
        <Breadcrumb :list="list" />
        <div class="container-fluid">
          <router-view></router-view>
        </div>
      </main>
    </div>
    <TheFooter>
      <!--footer-->
      <div>
        <a href="https://coreui.io">CoreUI</a>
        <span class="ml-1">&copy; 2018 creativeLabs.</span>
      </div>
      <div class="ml-auto">
        <span class="mr-1">Powered by</span>
        <a><b>brunorenz@github</b></a>
      </div>
    </TheFooter>
  </div>
</template>

<script>
// @ is an alias to /src
//import HelloWorld from "@/components/HelloWorld.vue";
import {
  Header as AppHeader,
  SidebarToggler,
  Sidebar as AppSidebar,
  SidebarFooter,
  SidebarForm,
  SidebarHeader,
  SidebarMinimizer,
  SidebarNav,
  Aside as AppAside,
  AsideToggler,
  Footer as TheFooter,
  Breadcrumb,
} from "@coreui/vue";
import HeaderDropdownAccount from "./HeaderDropdownAccount";
import { doLogon } from "@/services/security";
export default {
  name: "MainContainer",
  components: {
    AppHeader,
    AppSidebar,
    TheFooter,
    Breadcrumb,
    SidebarForm,
    SidebarFooter,
    SidebarToggler,
    SidebarHeader,
    SidebarNav,
    SidebarMinimizer,
    HeaderDropdownAccount,
  },
  computed: {
    name() {
      return this.$route.name;
    },
    list() {
      return this.$route.matched.filter(
        (route) => route.name || route.meta.label
      );
    },
    isUserLogged() {
      //let uid = this.$store.getters.sessione.uniqueId;
      let uid = this.$store.getters.uid;

      let logged = uid != "";
      console.log("React UID = " + uid + " - Logged " + logged);
      return logged;
    },
  },
  beforeMount: function() {
    // update logon status
    let uid = this.$store.getters.uid;
    if (uid != "") doLogon(uid);
    this.getNavBar();
    //this.refreshMenu();
  },
  data: function() {
    return {
      nav: {},
      navOn: {},
      navOff: {},
      logonStatus: false,
    };
  },
  methods: {
    checkLocalStorage() {
      if (window.localStorage) console.log("Local Storage Supported");
      else console.log("Local Storage Not Supported");
    },
    // refreshMenu() {
    //   this.$root.$on("MyBankLogon", (text) => {
    //     console.log("Event refreshMenu !!");
    //     this.getNavBar();
    //   });
    // },
    getNavBar() {
      let isLogged = true;
      let navLogon = [
        {
          name: "Logout",
          url: "/logout",
          icon: "fa fa-sign-out",
          badge: {
            variant: "primary",
          },
        },
        {
          name: "Configurazione",
          icon: "fa fa-gears",
          children: [
            {
              name: "Filtri",
              icon: "fa fa-filter",
              url: "/gestioneFiltri",
              attributes: { disabled: !isLogged },
            },
            {
              name: "Messaggi",
              icon: "fa fa-envelope-open",
              url: "/gestioneMessaggi",
              attributes: { disabled: !isLogged },
            },
            {
              name: "Regole",
              url: "/gestioneRegole",
              icon: "fa fa-handshake-o",
              badge: {
                variant: "primary",
              },
            },
          ],
        },
        {
          name: "Gestione Movimenti",
          url: "/gestioneMovimenti",
          icon: "fa fa-credit-card",
          attributes: { disabled: !isLogged },
        },
        {
          name: "Statistiche",
          url: "/statistiche",
          icon: "fa fa-bar-chart",
        },
      ];
      let navLogoff = [
        {
          name: "Login",
          url: "/login",
          icon: "fa fa-sign-in",
          badge: {
            variant: "primary",
          },
        },
      ];
      this.nav = isLogged ? navLogon : navLogoff;
      this.navOn = navLogon;
      this.navOff = navLogoff;
      this.logonStatus = isLogged;
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
