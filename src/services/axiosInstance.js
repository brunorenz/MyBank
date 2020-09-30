import axios from "axios";
import { doLogoff } from "@/services/security";
import router from "@/router";

const mainAxios = axios.create();

// Add a response interceptor
mainAxios.interceptors.response.use(
  function(response) {
    if (typeof response.data.error != "undefined") {
      console.log("(MAIN) Return code : " + response.data.error.code + " , Message : " + response.data.error.message);
    }
    return response;
  },
  function(error) {
    let a = error.toJSON();
    console.log("(MAIN) Error : " + error.toJSON());
    if (
      typeof error.response != "undefined" &&
      typeof error.response.status != "undefined" &&
      error.response.status === 403
    ) {
      doLogoff();
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

const oldAxios = axios.create();

export { mainAxios, oldAxios };
