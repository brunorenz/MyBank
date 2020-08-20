<template>
  <div class="app">
    <b-card :header="rulesHeaderLabel">
      <b-row class="ml-0">
        <b-form-group label="Tipo messaggio" class="col-sm-3">
          <b-form-radio-group
            id="messageTypeId"
            v-model="messageType"
            :options="messageTypeOptions"
            @input="changeType"
          ></b-form-radio-group>
        </b-form-group>
      </b-row>

      <b-table
        ref="rules"
        selectable
        select-mode="single"
        :items="rulesItems"
        :fields="rulesFields"
        selected-variant="primary"
        @row-selected="onRulesRowSelected"
        responsive="sm"
        sort-icon-left
        head-variant="light"
        striped
        small
        bordered
        sticky-header
        :busy="isRulesBusy"
      >
        <template v-slot:table-busy>
          <div class="text-center text-danger my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
        </template>
      </b-table>
      <b-row class="ml-0">
        <b-button variant="primary" @click="addRule">Aggiungi regola</b-button>
      </b-row>
    </b-card>

    <b-card header="Dettaglio" v-if="ruleDetailShow">
      <ruleDefinition
        :model="ruleSelected === null ? null : ruleSelected.rules"
        :type="messageType"
        v-on:updateRules="updateRules"
      ></ruleDefinition>
      <b-row class="ml-0">
        <b-button variant="primary" @click="updateRule(true)"
          >Aggiungi regola</b-button
        >
        <b-button variant="primary" @click="updateRule(true)"
          >Modifica regola</b-button
        >
        <b-button class="ml-2" variant="danger" @click="deleteRule(true)"
          >Elimina regola</b-button
        >
      </b-row>
    </b-card>
  </div>
</template>

<script>
import HttpMonitor from "@/services/httpMonitorRest";
import {
  showMsgEsitoEsecuzione,
  showMsgErroreEsecuzione,
  showConfirmationMessage,
} from "@/services/utilities";
import RuleDefinitionForm from "@/components/common/RuleDefinitionForm";

export default {
  name: "GestioneRegole",
  components: {
    ruleDefinition: RuleDefinitionForm,
  },
  data: function() {
    return {
      rulesFields: [],
      rulesItems: [],
      rulesSelected: [],
      rulesHeaderLabel: "",
      ruleDetailShow: false,
      messageType: "SMS",
      messageTypeOptions: [
        { text: "SMS", value: "SMS" },
        { text: "PUSH", value: "PUSH" },
      ],
      isRulesBusy: false,
      ruleSelected: null,
    };
  },
  mounted: function() {
    this.getRules();
  },
  methods: {
    changeType(name) {
      this.ruleDetailShow = false;
      this.reloadAndClear();
    },
    updateRules() {
      console.log("Update rules from FOMR !!");
    },
    addRule() {
      console.log("Add rule !!");
    },
    updateRule(confirm) {
      if (typeof confirm != "undefined")
        showConfirmationMessage(
          this,
          "Confermi l'aggiornamento della regola' ?",
          this.updateRule
        );
      else {
        console.log("Aggiorna regola !!");
      }
    },
    deleteRule(confirm) {
      if (typeof confirm != "undefined") {
        showConfirmationMessage(
          this,
          "Confermi la cancellazione della regola ?",
          this.deleteRule
        );
      } else {
        console.log("Elimina regola !!");
      }
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
      this.deselectRules();
      this.getRules();
    },

    onRulesRowSelected(items) {
      this.rulesSelected = items;
      if (items.length === 0) {
        this.ruleDetailShow = false;
        this.ruleSelected = null;
      } else {
        this.ruleSelected = items[0];
        this.ruleDetailShow = true;
      }
    },
    deselectRules() {
      this.$refs.rules.clearSelected();
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
    getRules() {
      this.isRulesBusy = true;
      let isSMS = this.messageType === "SMS";
      this.rulesHeaderLabel =
        "Regole per  " + (isSMS ? "messaggi SMS" : "notifiche PUSH");
      const httpService = new HttpMonitor();
      let label = isSMS ? "Origine messaggio" : "Nome pacchetto notifica";
      let field = [{ key: "key", label: label, sortable: true }];
      if (!isSMS) {
        field.push({ key: "key2", label: "Identificativo", sortable: true });
      }
      field.push({ key: "bankId", label: "Banca", sortable: true });
      this.rulesFields = field;
      httpService
        .getMessageRule(this.messageType)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          if (esito.code === 0) {
            let dati = data.data;
            var datiServers = [];
            for (var i = 0; i < dati.length; i++) {
              let record = dati[i];
              let entry = {
                key: record.key,
                bankId: record.bankId,
                _id: record._id,
                rules: record.rules,
              };
              if (!isSMS) {
                entry.key2 = record.key2;
              }
              datiServers.push(record);
            }
            this.rulesItems = datiServers;
          } else showMsgErroreEsecuzione(this, esito, "getMessageRule");
          this.isRulesBusy = false;
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error, "getMessageRule");
          this.isRulesBusy = false;
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
