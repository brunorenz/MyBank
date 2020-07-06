<template>
  <div class="app">
    <h1>Gestione Messaggi {{ this.$route.query.type }}</h1>
    <b-table
      ref="selectableTable"
      selectable
      :select-mode="selectMode"
      :items="items"
      :fields="fields"
      @row-selected="onRowSelected"
      responsive="sm"
      head-variant="light"
      striped
    >
      <!-- Example scoped slot for select state illustrative purposes -->
      <template v-slot:cell(selected)="{ rowSelected }">
        <template v-if="rowSelected">
          <span aria-hidden="true"><i class="fa fa-wrench"/></span>
          <span class="sr-only">Selected</span>
        </template>
        <template v-else>
          <span aria-hidden="true">&nbsp;</span>
          <span class="sr-only">Not selected</span>
        </template>
      </template>
    </b-table>
    <p>
      <b-row class="text-center">
        <b-button class="mx-2" @click="clearSelected" disabled="false"
          >Cancella selezione</b-button
        >
        <b-button class="mx-2" @click="deleteMessage" disabled="false"
          >Elimina messaggio</b-button
        >
        <b-button class="mx-2" variant="normal" @click="addMessage"
          >Aggiungi messaggio</b-button
        >
      </b-row>
    </p>
    <p>
      Selected Rows:<br />
      {{ selected }}
    </p>
  </div>
</template>

<script>
import HttpMonitor from "@/services/httpMonitorRest";

export default {
  name: "GestioneMessaggi",
  data: function() {
    return {
      fields: ["SENDER"],
      items: [],
      selectMode: "multi",
      selected: [],
    };
  },
  mounted: function() {
    this.getMessageFilter();
  },
  methods: {
    clearSelected() {
      this.$refs.selectableTable.clearSelected();
    },
    deleteMessage() {},
    onRowSelected(items) {
      this.selected = items;
    },
    addMessage() {},
    getMessageFilter() {
      const httpService = new HttpMonitor();
      let type = this.$route.query.type;
      let label = type === "SMS" ? "sender" : "package_name";
      this.fields = ["selezionato", label];
      httpService
        .getMessageFilter(type)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          if (esito.code === 0) {
            let dati = data.data;
            var datiServers = [];
            for (var i = 0; i < dati.length; i++) {
              datiServers.push(
                type === "SMS"
                  ? { sender: dati[i].sender, _id: dati[i]._id }
                  : { package_name: dati[i].packageName, _id: dati[i]._id }
              );
            }
            this.items = datiServers;
          } else
            console.log(
              "Error callig service 'getMessageFilter' : " + esito.message
            );
        })
        .catch((error) => {
          console.log("Error callig service 'getMessageFilter' : " + error);
        });
    },
  },
};
</script>

<style></style>
