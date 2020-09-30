<template>
  <div class="hello"></div>
</template>
<script>
import { doLogoff } from "@/services/security";
import router from "@/router";
export default {
  mounted: function() {
    doLogoff();
    // this.$store.commit("updateKeyStorage", {
    //   key: "uid",
    //   value: "",
    // });
    //this.$root.$emit("MyBankLogon", "logout");
    router.push("/login");
  },
};
</script>
