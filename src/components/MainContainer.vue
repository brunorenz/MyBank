<template>
  <div class="app">
    <AppHeader fixed>
      <SidebarToggler class="d-lg-none" display="md" mobile />
      <b-link class="navbar-brand" to="#">
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
      <SidebarToggler
        class="d-md-down-none"
        display="lg"
        :defaultOpen="false"
      />
      <b-navbar-nav class="d-md-down-none">
        <b-nav-item class="px-3" to="/dashboard">Dashboard</b-nav-item>
        <b-nav-item class="px-3" to="/gestione">Gestione</b-nav-item>
        <b-nav-item class="px-3" to="/statistiche">Statistiche</b-nav-item>
        <b-nav-item-dropdown class="px-3" text="Programmazione">
          <b-dropdown-item to="/programmazione/termostato"
            >Termostato</b-dropdown-item
          >
          <b-dropdown-item to="/programmazione/luce">Luce</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <HeaderDropdownAccount />
      </b-navbar-nav>
    </AppHeader>
    <div class="app-body">
      <AppSidebar fixed>
        <SidebarHeader />
        <SidebarForm />
        <SidebarNav :navItems="nav"></SidebarNav>
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
    // name() {
    //   return this.$route.name;
    // }
    name() {
      return this.$route.name;
    },
    list() {
      return this.$route.matched.filter(
        (route) => route.name || route.meta.label
      );
    },
  },
  beforeMount: function() {
    //this.checkLocalStorage();
  },
  data: function() {
    return {
      nav: [
        {
          name: "Login",
          url: "/login",
          icon: "fa fa-sign-in",
          badge: {
            variant: "primary",
          },
        },
        {
          name: "Gestione Messaggi",
          url: "/gestioneMessaggi",
          icon: "fa fa-envelope-open",
          children: [
            {
              name: "PUSH",
              url: "/gestioneMessaggi?type=PUSH",
              icon: "fa fa-thermometer-1",
              attributes: { disabled: false },
            },
            {
              name: "SMS",
              url: "/gestioneMessaggi?type=SMS",
              icon: "icon-star",
            },
          ],
        },
        {
          name: "Statistiche",
          url: "/statistiche",
          icon: "fa fa-bar-chart",
        },
      ],
    };
  },
  methods: {
    checkLocalStorage() {
      if (window.localStorage) console.log("Local Storage Supported");
      else console.log("Local Storage Not Supported");
    },
  },
};
</script>
