<template>
  <div class="hello"></div>
</template>
<script>
import { doLogoff } from "@/services/config";
import router from "@/router";
export default {
  mounted: function() {
    doLogoff();
    this.$root.$emit("MyBankLogon", "logout");
    router.push("/login");
  },
};
</script>
