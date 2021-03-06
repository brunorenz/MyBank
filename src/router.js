import Vue from "vue";
import VueRouter from "vue-router";
import { isUserLogged } from "@/services/security";

Vue.use(VueRouter);

// Containers
const MainContainer = () => import("@/components/MainContainer");
// const Login = () => import("@/components/Login");
// const Logout = () => import("@/components/Logout");
// const GestioneFiltri = () => import("@/components/GestioneFiltri");
// const GestioneMessaggi = () => import("@/components/GestioneMessaggi");
// const GestioneMovimenti = () => import("@/components/GestioneMovimenti");
// const GestioneRegole = () => import("@/components/GestioneRegole");

// Views
//const About = () => import("@/views/About.vue");

let route = function(path, name, guest) {
  let c = () => import("@/components/" + name);
  return {
    path,
    name,
    component: c,
    meta: {
      guest: guest === undefined ? false : guest,
    },
  };
};

let router = new VueRouter({
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
        route("/login", "Login", true),
        route("/logout", "Logout"),
        route("/gestioneFiltri", "GestioneFiltri"),
        route("/gestioneMessaggi", "GestioneMessaggi"),
        route("/gestioneMovimenti", "GestioneMovimenti"),
        route("/gestioneRegole", "GestioneRegole"),
        route("/gestioneCategorie", "GestioneCategorie"),
      ],
    },
    route("/404", "NotFound", true),
    {
      path: "*",
      redirect: "404",
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.meta.guest === false) {
    if (!isUserLogged()) {
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } else next();
  } else {
    next();
  }
});

export default router;
