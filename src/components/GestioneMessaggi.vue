<template>
  <div class="app">
    <b-card>
      <h3>Messaggi {{ this.$route.query.type }} ricevuti</h3>
      <b-table
        ref="selectableTableAll"
        selectable
        select-mode="single"
        :items="itemsAll"
        :fields="fieldsAll"
        selected-variant="primary"
        @row-selected="onRowSelectedAll"
        responsive="sm"
        sort-icon-left
        head-variant="light"
        striped
        small
        bordered
        sticky-header
      >
        <!-- Example scoped slot for select state illustrative purposes 
          <template v-slot:table-caption>Messaggi ricevuti</template>
          -->
        <!--
        <template v-slot:cell(selezionatoAA)="{ rowSelected }">
          <template v-if="rowSelected">
            <span aria-hidden="true">
              <i class="fa fa-check-square-o" />
            </span>
            <span class="sr-only">Selected</span>
          </template>
          <template v-else>
            <span aria-hidden="true">
              <i class="fa fa-square-o" />
            </span>
            <span class="sr-only">Not selected</span>
          </template>
        </template>
        -->
      </b-table>
      <!--
      <b-row class="justify-content-md-center">
        <b-button
          class="mx-2"
          variant="primary"
          v-b-toggle.collapse-2-inner
          :disabled="selectedAll.length === 0"
          >Mostra messaggi</b-button
        >
      </b-row>
      -->
    </b-card>
    <b-collapse id="collapse-2-inner" v-model="visibleMessage" class="mt-2">
      <b-card>
        <h3>Dettaglio Messaggi {{ this.$route.query.type }} ricevuti</h3>
        <b-table
          ref="sampleMessages"
          :items="itemsSampleMessages"
          :fields="fieldsSampleMessages"
          responsive="sm"
          sort-icon-left
          head-variant="light"
          striped
          small
          bordered
          sticky-header
        >
        </b-table>
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
      selected: [],
      type: "",
      fieldsAll: [],
      itemsAll: [],
      selectedAll: [],
      itemsSampleMessages: [],
      fieldsSampleMessages: [],
      visibleMessage: false,
    };
  },
  mounted: function() {
    this.type = this.$route.query.type;
    this.getNotificationMessage();
  },
  beforeUpdate: function() {
    console.log("BEFORE UPDATED");
    if (this.type != this.$route.query.type) {
      this.type = this.$route.query.type;
      this.getNotificationMessage();
    }
  },
  methods: {
    getRow(row) {
      console.log("ROW = " + row);
      return row;
    },
    clearSelectedAll() {
      this.$refs.selectableTableAll.clearSelected();
    },
    deleteMessageMsgBox() {
      this.showConfirmationMessage(
        "Confermi la cancellazione ?",
        this.deleteMessage
      );
    },
    addMessageMsgBox() {
      this.showConfirmationMessage("Confermi l'inserimento ?", this.addMessage);
    },
    addMessage() {
      let entry = { type: this.type };
      if (this.type === "SMS") entry.sender = this.selectedAll[0].key;
      else entry.packageName = this.selectedAll[0].key;
      console.log("add record " + entry);
      const httpService = new HttpMonitor();
      httpService
        .addMessageFilter(entry)
        .then((response) => {
          this.reloadAndClear();
        })
        .catch((error) => {
          console.log("Error callig service 'addMessageFilter' : " + error);
        });
    },
    deleteMessage() {
      // chiedi conferma
      const httpService = new HttpMonitor();
      let record = this.selected[0];
      httpService
        .deleteMessageFilter(record)
        .then((response) => {
          this.reloadAndClear();
        })
        .catch((error) => {
          console.log("Error callig service 'deleteMessageFilter' : " + error);
        });
    },
    reloadAndClear() {
      this.clearSelectedAll();
      this.getNotificationMessage();
    },
    onRowSelected(items) {
      this.selected = items;
    },
    onRowSelectedAll(items) {
      this.selectedAll = items;
      if (items.length === 0) this.visibleMessage = false;
      else {
        this.visibleMessage = true;
        this.listMessages();
      }
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
    getNotificationMessage() {
      const httpService = new HttpMonitor();
      //let type = this.$route.query.type;
      let label = this.type === "SMS" ? "Origine" : "Nome pacchetto";
      this.fieldsAll = [{ key: "key", label: label, sortable: true }];
      httpService
        .getNotificationMessage(this.type)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          if (esito.code === 0) {
            let dati = data.data;
            var datiServers = [];
            for (var i = 0; i < dati.length; i++) {
              datiServers.push({ key: dati[i] });
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
    listMessages() {
      const httpService = new HttpMonitor();
      //let type = this.$route.query.type;
      //let label = this.type === "SMS" ? "sender" : "package_name";
      this.fieldsSampleMessages = [
        { key: "date", label: "Data", sortable: true },
      ];
      if (this.type === "PUSH")
        this.fieldsSampleMessages.push({
          key: "sender",
          label: "Origine",
          sortable: true,
        });
      this.fieldsSampleMessages.push({
        key: "message",
        label: "Messaggio",
        sortable: true,
      });
      httpService
        .listMessages(this.type, this.selectedAll[0].key)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          if (esito.code === 0) {
            let dati = data.data;
            var datiServers = [];
            for (var i = 0; i < dati.length; i++) {
              let entry = {
                date: this.$moment(new Date(dati[i].time)).format(
                  "DD/MM/YY HH:MM"
                ),
              };
              if (this.type === "PUSH") entry.sender = dati[i].sender;
              entry.message = dati[i].message;
              datiServers.push(entry);
            }
            this.itemsSampleMessages = datiServers;
          } else
            console.log(
              "Error callig service 'listMessages' : " + esito.message
            );
        })
        .catch((error) => {
          console.log("Error callig service 'listMessages' : " + error);
        });
    },
  },
};
</script>

<style></style>
