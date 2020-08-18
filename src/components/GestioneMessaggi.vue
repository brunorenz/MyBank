<template>
  <div class="app">
    <b-card>
      <b-form-group label="Tipo messaggio" class="ml-3">
        <b-form-radio-group
          id="msgAccepted"
          v-model="messageType"
          :options="messageTypeOptions"
          @input="changeType"
        ></b-form-radio-group>
      </b-form-group>
      <h3>Messaggi {{ this.messageType }} ricevuti</h3>
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
      </b-table>
    </b-card>
    <b-collapse id="collapse-2-inner" v-model="visibleMessage" class="mt-2">
      <b-card>
        <h3>Dettaglio Messaggi {{ this.messageType }} ricevuti</h3>
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
          selectable
          select-mode="multi"
          selected-variant="primary"
          @row-selected="onRowSelectedMessage"
        >
        </b-table>
        <b-row class="justify-content-md-left">
          <b-button
            class="mx-2"
            variant="primary"
            :disabled="itemsSampleMessages.length === 0"
            @click="selectAllMessages"
            >Seleziona Tutti</b-button
          >
          <b-button
            class="mx-2"
            variant="primary"
            @click="deselectAllMessages"
            :disabled="selectedMessage.length === 0"
            >Annulla Selezione</b-button
          >
          <b-button
            class="mx-2"
            variant="primary"
            @click="processMessages"
            :disabled="selectedMessage.length === 0"
            >Analizza</b-button
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
      selectedMessage: [],
      fieldsAll: [],
      itemsAll: [],
      selectedAll: [],
      itemsSampleMessages: [],
      fieldsSampleMessages: [],
      visibleMessage: false,
      messageType: "SMS",
      messageTypeOptions: [
        { text: "SMS", value: "SMS" },
        { text: "PUSH", value: "PUSH" },
      ],
    };
  },
  mounted: function() {
    this.getNotificationMessage();
  },
  beforeUpdate: function() {
    // console.log("BEFORE UPDATED");
    // if (this.type != this.$route.query.type) {
    //   this.type = this.$route.query.type;
    //   this.getNotificationMessage();
    // }
  },
  methods: {
    changeType() {
      console.log("Change Type!! " + this.messageType);
      this.reloadAndClear();
    },
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
      let entry = { type: this.messageType };
      if (this.messageType === "SMS") entry.sender = this.selectedAll[0].key;
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
    onRowSelectedMessage(items) {
      this.selectedMessage = items;
    },
    onRowSelectedAll(items) {
      this.selectedAll = items;
      if (items.length === 0) this.visibleMessage = false;
      else {
        this.visibleMessage = true;
        this.listMessages();
      }
    },
    selectAllMessages() {
      this.$refs.sampleMessages.selectAllRows();
    },
    deselectAllMessages() {
      this.$refs.sampleMessages.clearSelected();
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
    processMessages() {
      this.showConfirmationMessage(
        "Confermi l'analisi dei messaggi selezionati ?",
        this.processSelectedMessages
      );
    },
    processSelectedMessages() {
      let msgIds = [];
      for (let ix = 0; ix < this.selectedMessage.length; ix++) {
        msgIds.push(this.selectedMessage[ix]["_id"]);
      }
      //console.log("process selected message " + JSON.stringify({ msgIds }));
      const httpService = new HttpMonitor();
      httpService
        .analizeMessages({ msgIds: msgIds })
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          if (esito.code === 0) {
            let msgs = data.data;
            let accepted = 0;
            let notAccepted = 0;
            let notFound = 0;
            for (let ix = 0; ix < msgs.length; ix++) {
              accepted += msgs[ix].accepted ? 1 : 0;
              notFound += msgs[ix].found ? 0 : 1;
              notAccepted += msgs[ix].accepted ? 0 : 1;
            }
            console.log(
              "Not found : " +
                notFound +
                " - Accepted " +
                accepted +
                " - Not accepted " +
                notAccepted
            );
          }
        })
        .catch((error) => {
          console.log("Error callig service 'getMessageFilter' : " + error);
        });
    },
    getNotificationMessage() {
      const httpService = new HttpMonitor();
      //let type = this.$route.query.type;
      let label = this.messageType === "SMS" ? "Origine" : "Nome pacchetto";
      this.fieldsAll = [{ key: "key", label: label, sortable: true }];
      httpService
        .getNotificationMessage(this.messageType)
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
      if (this.messageType === "PUSH")
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
        .listMessages(this.messageType, this.selectedAll[0].key)
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
                _id: dati[i]._id,
              };
              if (this.messageType === "PUSH") entry.sender = dati[i].sender;
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
