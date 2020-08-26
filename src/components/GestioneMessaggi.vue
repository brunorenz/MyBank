<template>
  <div class="app">
    <b-collapse v-model="receivedMessagesShow">
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
    </b-collapse>
    <b-collapse v-model="sampleMessagesShow">
      <b-card>
        <div slot="header">
          <b v-bind:style="defProgStyle">{{ sampleMessagesHeaderLabel }}</b>
        </div>
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
        <b-row class="ml-0" v-if="isRuleDefined === false">
          <b-button variant="primary" @click="manageRule(true)"
            >Aggiungi Regola</b-button
          >
        </b-row>
        <b-row class="ml-0" v-if="isRuleDefined === true">
          <b-button
            variant="primary"
            @click="manageRule(false)"
            :disabled="
              messageType === 'PUSH' && sampleMessagesSelected.length != 1
            "
            >Gestisci Regola</b-button
          >
          <b-button
            class="ml-2"
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
    <b-card :header="headerDetail" v-if="ruleShow === true">
      <ruleDefinition
        :message="selectedMessage"
        v-on:updateRules="updateRules"
      ></ruleDefinition>
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
  name: "GestioneMessaggi",
  components: {
    ruleDefinition: RuleDefinitionForm,
  },
  computed: {
    headerDetail: function() {
      let msg =
        "Dettaglio regola per " +
        (this.messageType === "SMS" ? "messaggio SMS" : "notifica PUSH");

      return msg;
    },
  },
  data: function() {
    return {
      receivedMessageFields: [],
      receivedMessageItems: [],
      receivedMessageSelected: [],
      receivedMessageHeaderLabel: "",
      receivedMessagesShow: true,
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
      defProgStyle: "",
      isRuleDefined: false,
      rules: null,
      ruleShow: false,
      selectedMessage: null,
    };
  },
  mounted: function() {
    this.getNotificationMessage();
  },
  methods: {
    updateRules() {
      this.reloadAndClear();
      this.ruleShow = false;
      this.sampleMessagesShow = false;
      this.receivedMessagesShow = true;
    },
    manageRule(add) {
      console.log("Add rule : " + add);
      let msg = null;
      if (this.sampleMessagesSelected.length === 0)
        msg = this.sampleMessagesItems[0].fullMessage;
      else msg = this.sampleMessagesSelected[0].fullMessage;
      //msg.type = this.messageType;
      this.selectedMessage = msg;
      this.ruleShow = true;
      this.sampleMessagesShow = false;
      this.receivedMessagesShow = false;
    },
    changeType(name) {
      this.reloadAndClear();
    },
    changeNumber(value) {
      this.reloadAndClear();
    },

    clearSelectedAll() {
      this.$refs.receivedMessage.clearSelected();
    },
    reloadAndClear() {
      this.ruleShow = false;
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
      this.ruleShow = false;
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
        msgIds.push(this.sampleMessagesSelected[ix]["fullMessage"]["_id"]);
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
                //console.log("String : " + s + " -> " + dati[i]);
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
      //TODO impostare limite
      // recupero messagi e regole
      let isSMS = this.messageType === "SMS";
      this.isSampleMessagesBusy = true;
      let self = this;
      const httpService = new HttpMonitor();
      let selectedRecord = this.receivedMessageSelected[0];
      let alP = [];
      let p1 = new Promise(function(resolve, reject) {
        console.log("Promise P1!");
        httpService
          .getMessageRule(
            self.messageType,
            selectedRecord.key,
            selectedRecord.key2
          )
          .then((response) => {
            resolve(response.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
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
          key: "fullMessage.sender",
          label: "Origine",
          sortable: true,
        });
      this.sampleMessagesFields.push({
        key: "fullMessage.message",
        label: "Messaggio",
        sortable: true,
      });
      let p2 = new Promise(function(resolve, reject) {
        console.log("Promise P2!");
        httpService
          .listMessages(self.messageType, selectedRecord.key)
          .then((response) => {
            resolve(response.data);
          })
          .catch((error) => {
            reject(error);
          });
      });

      Promise.all([p1, p2])
        .then(function(values) {
          // analize rule
          let esito = values[0].error;
          let found = false;
          if (esito.code === 0) {
            if (values[0].data.length > 0) {
              found = true;
              self.rules = values[0].data;
            }
          }
          self.isRuleDefined = found;
          // analize message
          esito = values[1].error;
          if (esito.code === 0) {
            let dati = values[1].data;
            var datiServers = [];
            for (var i = 0; i < dati.length; i++) {
              let entry = {
                date: self
                  .$moment(new Date(dati[i].time))
                  .format("DD/MM/YY HH:MM"),
                //_id: dati[i]._id,
                fullMessage: dati[i],
              };
              //if (!isSMS) entry.sender = dati[i].sender;
              //entry.message = dati[i].message;
              datiServers.push(entry);
            }
            self.sampleMessagesItems = datiServers;
          } else showMsgErroreEsecuzione(self, esito, "listMessages");

          self.isSampleMessagesBusy = false;
        })
        .catch(function(error) {
          showMsgErroreEsecuzione(self, error, "listMessages");
          self.isSampleMessagesBusy = false;
        });
    },
  },
};
</script>

<style></style>
