<template>
  <div class="app">
    <b-card :header="receivedMessageHeaderLabel">
      <b-row class="ml-0">
        <b-form-group label="Tipo messaggio" class="col-sm-3">
          <b-form-radio-group
            id="messageTypeId"
            v-model="messageType"
            :options="messageTypeOptions"
            @input="changeType"
          ></b-form-radio-group>
        </b-form-group>
        <b-form-group
          label="Escludi numeri telefonici"
          class="col-sm-3"
          :disabled="messageType != 'SMS'"
        >
          <b-form-checkbox
            id="excludeNumberId"
            v-model="excludeNumber"
            :options="messageTypeOptions"
            @change="changeNumber"
          ></b-form-checkbox>
        </b-form-group>
      </b-row>

      <b-table
        ref="receivedMessage"
        selectable
        select-mode="single"
        :items="receivedMessageItems"
        :fields="receivedMessageFields"
        selected-variant="primary"
        @row-selected="onReceivedMessageRowSelected"
        responsive="sm"
        sort-icon-left
        head-variant="light"
        striped
        small
        bordered
        sticky-header
        :busy="isReceivedMessageBusy"
      >
        <template v-slot:table-busy>
          <div class="text-center text-danger my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
        </template>
      </b-table>
    </b-card>
    <b-collapse id="collapse-2-inner" v-model="sampleMessagesShow" class="mt-2">
      <b-card :header="sampleMessagesHeaderLabel">
        <b-table
          ref="sampleMessages"
          :items="sampleMessagesItems"
          :fields="sampleMessagesFields"
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
          @row-selected="onSampleMessagesRowSelected"
          :busy="isSampleMessagesBusy"
        >
          <template v-slot:table-busy>
            <div class="text-center text-danger my-2">
              <b-spinner class="align-middle"></b-spinner>
              <strong>Loading...</strong>
            </div>
          </template>
        </b-table>
        <b-row class="ml-0">
          <b-button
            variant="primary"
            :disabled="sampleMessagesItems.length === 0"
            @click="selectAllMessages"
            >Seleziona Tutti</b-button
          >
          <b-button
            class="ml-2"
            variant="primary"
            @click="deselectAllMessages"
            :disabled="sampleMessagesSelected.length === 0"
            >Annulla Selezione</b-button
          >
          <b-button
            class="ml-2"
            variant="primary"
            @click="processMessages"
            :disabled="sampleMessagesSelected.length === 0"
            >Analizza</b-button
          >
        </b-row>
      </b-card>
    </b-collapse>
  </div>
</template>

<script>
import HttpMonitor from "@/services/httpMonitorRest";
import {
  showMsgEsitoEsecuzione,
  showMsgErroreEsecuzione,
  showConfirmationMessage,
} from "@/services/utilities";

export default {
  name: "GestioneMessaggi",
  data: function() {
    return {
      receivedMessageFields: [],
      receivedMessageItems: [],
      receivedMessageSelected: [],
      receivedMessageHeaderLabel: "",
      sampleMessagesItems: [],
      sampleMessagesFields: [],
      sampleMessagesSelected: [],
      sampleMessagesShow: false,
      sampleMessagesHeaderLabel: "",
      messageType: "SMS",

      messageTypeOptions: [
        { text: "SMS", value: "SMS" },
        { text: "PUSH", value: "PUSH" },
      ],
      isReceivedMessageBusy: false,
      isSampleMessagesBusy: false,
      excludeNumber: true,
    };
  },
  mounted: function() {
    this.getNotificationMessage();
  },
  methods: {
    changeType(name) {
      this.reloadAndClear();
    },
    changeNumber(value) {
      this.reloadAndClear();
    },
    getRow(row) {
      console.log("ROW = " + row);
      return row;
    },
    clearSelectedAll() {
      this.$refs.receivedMessage.clearSelected();
    },
    deleteMessageMsgBox() {
      showConfirmationMessage(
        this,
        "Confermi la cancellazione ?",
        this.deleteMessage
      );
    },
    addMessageMsgBox() {
      showConfirmationMessage(
        this,
        "Confermi l'inserimento ?",
        this.addMessage
      );
    },
    addMessage() {
      let entry = { type: this.messageType };
      if (this.messageType === "SMS")
        entry.sender = this.receivedMessageSelected[0].key;
      else entry.packageName = this.receivedMessageSelected[0].key;
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
    onSampleMessagesRowSelected(items) {
      this.sampleMessagesSelected = items;
    },
    onReceivedMessageRowSelected(items) {
      this.receivedMessageSelected = items;
      if (items.length === 0) this.sampleMessagesShow = false;
      else {
        this.sampleMessagesShow = true;
        this.listMessages();
      }
    },
    selectAllMessages() {
      this.$refs.sampleMessages.selectAllRows();
    },
    deselectAllMessages() {
      this.$refs.sampleMessages.clearSelected();
    },
    processMessages() {
      showConfirmationMessage(
        this,
        "Confermi l'analisi dei messaggi selezionati ?",
        this.processSelectedMessages
      );
    },
    processSelectedMessages() {
      let msgIds = [];
      for (let ix = 0; ix < this.sampleMessagesSelected.length; ix++) {
        msgIds.push(this.sampleMessagesSelected[ix]["_id"]);
      }
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
            showMsgEsitoEsecuzione(
              this,
              `Non trovati : ${notFound} - Accettati : ${accepted} - Non accettati : ${notAccepted}`
            );
          } else showMsgErroreEsecuzione(this, esito, "analizeMessages");
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error, "analizeMessages");
        });
    },
    getNotificationMessage() {
      this.isReceivedMessageBusy = true;
      this.receivedMessageHeaderLabel =
        "Messaggi " + this.messageType + " Ricevuti";
      const httpService = new HttpMonitor();
      //let type = this.$route.query.type;
      let isSMS = this.messageType === "SMS";
      let label = isSMS ? "Origine messaggio" : "Nome pacchetto notifica";
      this.receivedMessageFields = [
        { key: "key", label: label, sortable: true },
      ];
      httpService
        .getNotificationMessage(this.messageType)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          if (esito.code === 0) {
            let dati = data.data;
            var datiServers = [];
            for (var i = 0; i < dati.length; i++) {
              if (isSMS) {
                let s = isNaN(dati[i]);
                console.log("String : " + s + " -> " + dati[i]);
                if (s) datiServers.push({ key: dati[i] });
                else if (!this.excludeNumber)
                  datiServers.push({ key: dati[i] });
              } else datiServers.push({ key: dati[i] });
            }
            this.receivedMessageItems = datiServers;
          } else showMsgErroreEsecuzione(this, esito, "getNotificationMessage");
          this.isReceivedMessageBusy = false;
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error, "getNotificationMessage");
          this.isReceivedMessageBusy = false;
        });
    },
    listMessages() {
      let isSMS = this.messageType === "SMS";
      this.isSampleMessagesBusy = true;
      const httpService = new HttpMonitor();
      this.sampleMessagesHeaderLabel =
        (isSMS
          ? "Dettaglio messaggi SMS ricevuti da "
          : "Dettaglio notifiche PUSH ricevute da ") +
        this.receivedMessageSelected[0].key;
      this.sampleMessagesFields = [
        { key: "date", label: "Data", sortable: true },
      ];
      if (!isSMS)
        this.sampleMessagesFields.push({
          key: "sender",
          label: "Origine",
          sortable: true,
        });
      this.sampleMessagesFields.push({
        key: "message",
        label: "Messaggio",
        sortable: true,
      });
      httpService
        .listMessages(this.messageType, this.receivedMessageSelected[0].key)
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
              if (!isSMS) entry.sender = dati[i].sender;
              entry.message = dati[i].message;
              datiServers.push(entry);
            }
            this.sampleMessagesItems = datiServers;
          } else showMsgErroreEsecuzione(this, esito, "listMessages");
          this.isSampleMessagesBusy = false;
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error, "listMessages");
          this.isSampleMessagesBusy = false;
        });
    },
  },
};
</script>

<style></style>
