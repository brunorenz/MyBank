<template>
  <div class="app">
    <header>
      <b-navbar toggleable type="light" style="background-color: #e3f2fd;">
        <b-navbar-brand href="#">
          <img
            src="img/icons/iconfinder_walletmoneyshoppingatmcard_128.png"
            width="50"
            height="50"
            alt="MyBank"
          />MyBank
        </b-navbar-brand>
        <!--
  <span class="navbar-toggler-icon"></span>
-->
        <b-navbar-toggle
          target="navbar-toggle-collapse"
          class="d-none d-sm-block"
        >
          <template v-slot:default="{ expanded }">
            <b-icon v-if="expanded" icon="chevron-bar-up"></b-icon>
            <b-icon v-else icon="chevron-bar-down"></b-icon>
          </template>
        </b-navbar-toggle>

        <b-collapse id="navbar-toggle-collapse" is-nav>
          <b-navbar-nav class="d-md-down-none">
            <b-nav-item class="px-3" to="/dashboard">Dashboard</b-nav-item>
            <b-nav-item class="px-3" href="#">Link 1</b-nav-item>
            <b-nav-item class="px-3" href="#">Link 2</b-nav-item>
            <b-nav-item class="px-3" href="#" disabled
              >Configurazione</b-nav-item
            >
            <b-nav-item-dropdown class="px-3" text="Programmazione">
              <b-dropdown-item to="/programmazione/termostato"
                >Termostato</b-dropdown-item
              >
              <b-dropdown-item to="/programmazione/luce">Luce</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </header>
    <div class="app-body">
      <main class="main">
        <div class="container-fluid">
          <router-view></router-view>
        </div>
      </main>
    </div>
    <div class="mr-auto">
      <span class="mr-11">Powered by</span>
      <a><b>brunorenz@github</b></a>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
//import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "home",
  components: {},
};
</script>
