<template>
  <div class="app">
    <b-card>
      <h2>Gestione Messaggi {{ this.$route.query.type }}</h2>
      <b-table
        ref="selectableTable"
        selectable
        :select-mode="selectMode"
        :items="items"
        :fields="fields"
        selected-variant="primary"
        @row-selected="onRowSelected"
        responsive="sm"
        sort-icon-left
        head-variant="light"
        striped
      >
        <template v-slot:cell(selezionato)="{ rowSelected }">
          <template v-if="rowSelected">
            <span aria-hidden="true"><i class="fa fa-check-square-o"/></span>
            <span class="sr-only">Selected</span>
          </template>
          <template v-else>
            <span aria-hidden="true"><i class="fa fa-square-o"/></span>
            <span class="sr-only">Not selected</span>
          </template>
        </template>
      </b-table>
      <b-row class="justify-content-md-center">
        <b-button
          class="mx-2"
          variant="primary"
          @click="deleteMessageMsgBox"
          :disabled="selected.length === 0"
          >Elimina filtro</b-button
        >
        <b-button
          class="mx-2"
          variant="primary"
          v-b-toggle.collapse-1-inner
          @click="addMessage"
          >Aggiungi filtro</b-button
        >
      </b-row>
    </b-card>
    <p>
      Selected Rows:<br />
      {{ selected }}<br />{{ selectedAll }}
    </p>
    <b-collapse id="collapse-1-inner" class="mt-2">
      <b-card>
        <h2>Messaggi {{ this.$route.query.type }} salvati</h2>
        <b-table
          ref="selectableTableAll"
          selectable
          :select-mode="multi"
          :items="itemsAll"
          :fields="fieldsAll"
          selected-variant="primary"
          @row-selected="onRowSelectedAll"
          responsive="sm"
          sort-icon-left
          head-variant="light"
          striped
        >
          <!-- Example scoped slot for select state illustrative purposes -->
          <template v-slot:cell(selezionatoAA)="{ row }">
            <template v-if="row">
              <span aria-hidden="true"><i class="fa fa-check-square-o"/></span>
            </template>
            <template v-else>
              <span aria-hidden="true"><i class="fa fa-square-o"/></span>
            </template>
          </template>
        </b-table>
        <b-row class="justify-content-md-center">
          <b-button
            class="mx-2"
            variant="primary"
            @click="addMessageAll"
            :disabled="selectedAll.length === 0"
            >Aggiungi</b-button
          >
        </b-row>
      </b-card>
    </b-collapse>
  </div>
</template>

<script>
import HttpMonitor from "@/services/httpMonitorRest";

export default {
  name: "GestioneMessaggi",
  data: function() {
    return {
      fields: [],
      items: [],
      selectMode: "single",
      selected: [],
      type: "",
      fieldsAll: [],
      itemsAll: [],
      selectModeAll: "single",
      selectedAll: [],
    };
  },
  mounted: function() {
    this.type = this.$route.query.type;
    this.getMessageFilter();
    this.getNotificationMessage();
  },
  beforeUpdate: function() {
    console.log("BEFORE UPDATED");
    if (this.type != this.$route.query.type) {
      this.type = this.$route.query.type;
      this.getMessageFilter();
      this.getNotificationMessage();
    }
  },
  methods: {
    clearSelected() {
      this.$refs.selectableTable.clearSelected();
    },
    deleteMessageMsgBox() {
      this.showConfirmationMessage(
        "Confermi la cancellazione ?",
        this.deleteMessage
      );
    },
    deleteMessage() {
      // chiedi conferma
      const httpService = new HttpMonitor();
      let record = this.selected[0];
      httpService
        .deleteMessageFilter(record)
        .then((response) => {
          this.getMessageFilter();
        })
        .catch((error) => {
          console.log("Error callig service 'deleteMessageFilter' : " + error);
        });
    },
    onRowSelected(items) {
      this.selected = items;
    },
    onRowSelectedAll(items) {
      this.selectedAll = items;
    },
    showConfirmationMessage(message, operation) {
      this.$bvModal
        .msgBoxConfirm(message)
        .then((value) => {
          if (value) operation();
        })
        .catch((err) => {
          // An error occurred
          console.error("Errore in msgbox conferma operazione : " + err);
        });
    },
    addMessage() {},
    getMessageFilter() {
      const httpService = new HttpMonitor();
      //let type = this.$route.query.type;
      let label = this.type === "SMS" ? "Origine" : "Nome pacchetto";
      this.fields = [
        { key: "selezionato" },
        { key: "key", label: label, sortable: true },
      ];
      httpService
        .getMessageFilter(this.type)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          if (esito.code === 0) {
            let dati = data.data;
            var datiServers = [];
            for (var i = 0; i < dati.length; i++) {
              // datiServers.push(
              //   this.type === "SMS"
              //     ? { sender: dati[i].sender, _id: dati[i]._id }
              //     : { package_name: dati[i].packageName, _id: dati[i]._id }
              // );
              datiServers.push(
                this.type === "SMS"
                  ? { key: dati[i].sender, _id: dati[i]._id }
                  : { key: dati[i].packageName, _id: dati[i]._id }
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
    getNotificationMessage() {
      const httpService = new HttpMonitor();
      //let type = this.$route.query.type;
      let label = this.type === "SMS" ? "sender" : "package_name";
      this.fieldsAll = [
        { key: "selezionatoAA", label: "Selezionato" },
        { key: label, sortable: true },
      ];
      httpService
        .getNotificationMessage(this.type)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          if (esito.code === 0) {
            let dati = data.data;
            var datiServers = [];
            for (var i = 0; i < dati.length; i++) {
              datiServers.push(
                this.type === "SMS"
                  ? { sender: dati[i] }
                  : { package_name: dati[i] }
              );
            }
            this.itemsAll = datiServers;
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
