import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

// Containers
const MainContainer = () => import("@/components/MainContainer");
const Login = () => import("@/components/Login");
const Logout = () => import("@/components/Logout");
const GestioneFiltri = () => import("@/components/GestioneFiltri");
const GestioneMessaggi = () => import("@/components/GestioneMessaggi");
const GestioneMovimenti = () => import("@/components/GestioneMovimenti");
const GestioneRegole = () => import("@/components/GestioneRegole");

// Views
//const About = () => import("@/views/About.vue");

export default new Router({
  //mode: 'history',
  //base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "Home",
      component: MainContainer,
      children: [
        // {
        //   path: "about",
        //   name: "About",
        //   // route level code-splitting
        //   // this generates a separate chunk (about.[hash].js) for this route
        //   // which is lazy-loaded when the route is visited.
        //   component: About,
        //   meta: {
        //     guest: true,
        //   },
        // },
        {
          path: "login",
          name: "Login",
          component: Login,
          meta: {
            guest: true,
          },
        },
        {
          path: "logout",
          name: "Logout",
          component: Logout,
          meta: {
            guest: false,
          },
        },
        {
          path: "gestioneFiltri",
          name: "GestioneFiltri",
          component: GestioneFiltri,
          meta: {
            guest: false,
          },
        },
        {
          path: "gestioneMessaggi",
          name: "GestioneMessaggi",
          component: GestioneMessaggi,
          meta: {
            guest: false,
          },
        },
        {
          path: "gestioneMovimenti",
          name: "GestioneMovimenti",
          component: GestioneMovimenti,
          meta: {
            guest: false,
          },
        },
        {
          path: "gestioneRegole",
          name: "GestioneRegole",
          component: GestioneRegole,
          meta: {
            guest: false,
          },
        },
      ],
    },
  ],
});
