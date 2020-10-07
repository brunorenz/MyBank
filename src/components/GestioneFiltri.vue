<template>
  <div class="app">
    <b-card :header="filterHeaderLabel">
      <b-form-group label="Seleziona tipo messaggio" class="col-sm-3">
        <b-form-radio-group
          id="messageTypeId"
          v-model="messageType"
          :options="messageTypeOptions"
          @input="changeType"
        ></b-form-radio-group>
      </b-form-group>
      <b-table
        ref="filterTable"
        selectable
        select-mode="single"
        :items="filterItems"
        :fields="filterFields"
        selected-variant="primary"
        @row-selected="onFilterRowSelected"
        responsive="sm"
        sort-icon-left
        head-variant="light"
        striped
        small
        bordered
      >
        <template v-slot:cell(selezionato)="{ rowSelected }">
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
      </b-table>
      <b-row class="justify-content-md-center">
        <b-button class="mx-2" variant="primary" @click="deleteMessageMsgBox" :disabled="filterSelected.length === 0"
          >Elimina filtro</b-button
        >
        <b-button class="mx-2" variant="primary" v-b-toggle.collapse-1-inner>Aggiungi filtro</b-button>
      </b-row>
    </b-card>
    <b-collapse id="collapse-1-inner">
      <b-card :header="notFilteredMessageHeaderLabel">
        <b-table
          ref="notFilteredMessageTable"
          selectable
          select-mode="single"
          :items="itemsAll"
          :fields="fieldsAll"
          selected-variant="primary"
          @row-selected="onNotFilteredMessagRowSelected"
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
        </b-table>
        <b-row class="justify-content-md-center">
          <b-button class="mx-2" variant="primary" v-b-toggle.collapse-2-inner :disabled="selectedAll.length === 0"
            >Mostra messaggi</b-button
          >
          <b-button class="mx-2" variant="primary" @click="addMessageMsgBox" :disabled="selectedAll.length === 0"
            >Aggiungi</b-button
          >
        </b-row>
      </b-card>
    </b-collapse>
    <b-collapse id="collapse-2-inner" v-model="visibleMessage" class="mt-2">
      <b-card :header="sampleMessagesHeaderLabel">
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
import HttpManager from "@/services/HttpManager";
import {
  GET_MESSAGEFILTER,
  GET_NOTIFICATIONMESSAGE,
  LIST_MESSAGES,
  ADD_MESSAGEFILTER,
  DELETE_MESSAGEFILTER,
  getServiceInfo,
} from "@/services/restServices";

import { showMsgEsitoEsecuzione, showMsgErroreEsecuzione, showConfirmationMessage } from "@/services/utilities";

export default {
  name: "GestioneMessaggi",
  data: function() {
    return {
      filterFields: [],
      filterItems: [],
      filterSelected: [],
      filterHeaderLabel: "",
      type: "",
      fieldsAll: [],
      itemsAll: [],
      selectedAll: [],
      notFilteredMessageHeaderLabel: "",
      itemsSampleMessages: [],
      fieldsSampleMessages: [],
      sampleMessagesHeaderLabel: "",
      visibleMessage: false,
      messageType: "SMS",
      messageTypeOptions: [
        { text: "SMS", value: "SMS" },
        { text: "PUSH", value: "PUSH" },
      ],
    };
  },
  mounted: function() {
    this.getMessageFilter();
    this.getNotificationMessage();
  },
  methods: {
    changeType() {
      this.reloadAndClear();
    },
    getRow(row) {
      console.log("ROW = " + row);
      return row;
    },
    clearSelected() {
      this.$refs.filterTable.clearSelected();
    },
    clearSelectedAll() {
      this.$refs.notFilteredMessageTable.clearSelected();
    },
    deleteMessageMsgBox() {
      showConfirmationMessage(this, "Confermi la cancellazione ?", this.deleteMessage);
    },
    addMessageMsgBox() {
      showConfirmationMessage(this, "Confermi l'inserimento ?", this.addMessage);
    },
    addMessage() {
      let entry = { type: this.messageType };
      if (this.messageType === "SMS") entry.sender = this.selectedAll[0].key;
      else entry.packageName = this.selectedAll[0].key;
      console.log("add record " + entry);
      const httpService = new HttpManager();
      let info = getServiceInfo(ADD_MESSAGEFILTER);
      info.request = entry;
      httpService
        .callNodeServer(info)
        .then((response) => {
          this.reloadAndClear();
        })
        .catch((error) => {
          console.log("Error callig service 'addMessageFilter' : " + error);
          showMsgErroreEsecuzione(this);
        });
    },
    deleteMessage() {
      // chiedi conferma
      const httpService = new HttpManager();
      let info = getServiceInfo(DELETE_MESSAGEFILTER);
      info.request = this.filterSelected[0];
      httpService
        .callNodeServer(info)
        .then((response) => {
          this.reloadAndClear();
        })
        .catch((error) => {
          console.log("Error callig service 'deleteMessageFilter' : " + error);
          showMsgErroreEsecuzione(this, error);
        });
    },
    reloadAndClear() {
      this.clearSelected();
      this.clearSelectedAll();
      this.getMessageFilter();
      this.getNotificationMessage();
    },
    onFilterRowSelected(items) {
      this.filterSelected = items;
    },
    onNotFilteredMessagRowSelected(items) {
      this.selectedAll = items;
      if (items.length === 0) this.visibleMessage = false;
      else this.listMessages();
    },
    getMessageFilter() {
      const httpService = new HttpManager();
      let info = getServiceInfo(GET_MESSAGEFILTER);
      info.query.type = this.messageType;
      let isSMS = this.messageType === "SMS";
      let label = isSMS ? "Origine" : "Nome pacchetto";
      this.filterHeaderLabel = "Filtri attivi per " + (isSMS ? "messaggi SMS" : "notifiche PUSH");
      this.filterFields = [
        { key: "selezionato", label: "Selezionato" },
        { key: "key", label: label, sortable: true },
      ];
      httpService
        .callNodeServer(info)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          if (esito.code === 0) {
            let dati = data.data;
            var datiServers = [];
            for (var i = 0; i < dati.length; i++) {
              datiServers.push(
                isSMS ? { key: dati[i].sender, _id: dati[i]._id } : { key: dati[i].packageName, _id: dati[i]._id }
              );
            }
            this.filterItems = datiServers;
          } else showMsgErroreEsecuzione(this); //, esito, "getMessageFilter");
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error); //, error, "getMessageFilter");
        });
    },
    getNotificationMessage() {
      const httpService = new HttpManager();
      let info = getServiceInfo(GET_NOTIFICATIONMESSAGE);
      info.query.type = this.messageType;
      let isSMS = this.messageType === "SMS";
      this.notFilteredMessageHeaderLabel = (isSMS ? "Messaggi SMS" : "Notifiche PUSH") + " accettati";
      let label = isSMS ? "Origine" : "Nome pacchetto";
      this.fieldsAll = [
        { key: "selezionatoAA", label: "Selezionato" },
        { key: "key", label: label, sortable: true },
      ];
      httpService
        .callNodeServer(info)
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
          } else showMsgErroreEsecuzione(this); //, esito, "getNotificationMessage");
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error); //, error, "getNotificationMessage");
        });
    },
    listMessages() {
      let isSMS = this.messageType === "SMS";
      this.sampleMessagesHeaderLabel =
        (isSMS ? "Ultimi messaggi SMS ricevuti da " : "Ultime notifiche PUSH ricevite da ") + this.selectedAll[0].key;
      this.fieldsSampleMessages = [{ key: "date", label: "Data", sortable: true }];
      if (!isSMS)
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
      const httpService = new HttpManager();
      let info = getServiceInfo(LIST_MESSAGES);
      info.query.type = this.messageType;
      info.query.filter = this.selectedAll[0].key;
      httpService
        .callNodeServer(info)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          if (esito.code === 0) {
            let dati = data.data;
            var datiServers = [];
            for (var i = 0; i < dati.length; i++) {
              let entry = {
                date: this.$moment(new Date(dati[i].time)).format("DD/MM/YY HH:MM"),
              };
              if (!isSMS) entry.sender = dati[i].sender;
              entry.message = dati[i].message;
              datiServers.push(entry);
            }
            this.itemsSampleMessages = datiServers;
          } else showMsgErroreEsecuzione(this); //, esito, "listMessages");
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error); //), error, "listMessages");
        });
    },
  },
};
</script>

<style></style>
