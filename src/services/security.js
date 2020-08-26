export function checkSecurity(router) {
  if (SecurityConfiguration.jwtRequired) {
    let token = window.sessionStorage.getItem("jwttoken");
    if (token == null) {
      router.push("/login");
    }
  }
}
// Definizioni da Server

// Sicurezza
export var SecurityConfiguration = {
  basicAuth: "Basic YWRtaW46YWgwNjB2eUEu",
  basicAuthRequired: true,
  jwtRequired: true,
};

export function isUserLogged() {
  return window.sessionStorage.getItem("jwt") != null;
}

export function doLogoff() {
  window.sessionStorage.removeItem("jwttoken");
  window.sessionStorage.removeItem("jwt");
}

export function getXrfToken() {
  return window.sessionStorage.getItem("jwttoken");
}
