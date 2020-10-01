<template>
  <div class="app">
    <b-collapse v-model="ruleListShow">
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
      </b-card>
    </b-collapse>
    <b-card :header="headerDetail" v-if="ruleDetailShow">
      <ruleDefinition :ruleId="ruleSelectedId" v-on:updateRules="updateRules"></ruleDefinition>
    </b-card>
  </div>
</template>

<script>
import HttpManager from "@/services/HttpManager";
import { GET_RULES, getServiceInfo } from "@/services/restServices";
import { showMsgEsitoEsecuzione, showMsgErroreEsecuzione, showConfirmationMessage } from "@/services/utilities";
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
      ruleListShow: true,
      ruleDetailShow: false,
      messageType: "SMS",
      messageTypeOptions: [
        { text: "SMS", value: "SMS" },
        { text: "PUSH", value: "PUSH" },
      ],
      isRulesBusy: false,
      ruleSelectedId: null,
      messageId: null,
    };
  },
  mounted: function() {
    this.getRules();
  },
  computed: {
    headerDetail: function() {
      let msg = "Dettaglio regola per " + (this.messageType === "SMS" ? "messaggio SMS" : "notifica PUSH");

      return msg;
    },
  },
  beforeUpdate: function() {},
  methods: {
    changeType(name) {
      this.reloadAndClear();
    },
    updateRules() {
      console.log("Update rules from FROM !!");
      this.deselectRules();
    },
    // addRule() {
    //   console.log("Add rule !!");
    // },
    reloadAndClear() {
      this.deselectRules();
      this.getRules();
    },
    updateRule(confirm) {
      if (typeof confirm != "undefined")
        showConfirmationMessage(this, "Confermi l'aggiornamento della regola' ?", this.updateRule);
      else {
        console.log("Aggiorna regola !!");
      }
    },
    deleteRule(confirm) {
      if (typeof confirm != "undefined") {
        showConfirmationMessage(this, "Confermi la cancellazione della regola ?", this.deleteRule);
      } else {
        console.log("Elimina regola !!");
      }
    },
    addMessageMsgBox() {
      showConfirmationMessage(this, "Confermi l'inserimento ?", this.addMessage);
    },
    onRulesRowSelected(items) {
      this.rulesSelected = items;
      if (items.length === 0) {
        this.ruleDetailShow = false;
        this.ruleListShow = true;
        this.ruleSelectedId = null;
      } else {
        this.ruleSelectedId = items[0]._id;
        this.ruleDetailShow = true;
        this.ruleListShow = false;
      }
    },
    deselectRules() {
      this.$refs.rules.clearSelected();
    },
    processMessages() {
      showConfirmationMessage(this, "Confermi l'analisi dei messaggi selezionati ?", this.processSelectedMessages);
    },

    getRules() {
      this.isRulesBusy = true;
      let isSMS = this.messageType === "SMS";
      this.rulesHeaderLabel = "Regole per  " + (isSMS ? "messaggi SMS" : "notifiche PUSH");
      let label = isSMS ? "Origine messaggio" : "Nome pacchetto notifica";
      let field = [{ key: "key", label: label, sortable: true }];
      if (!isSMS) {
        field.push({ key: "key2", label: "Identificativo", sortable: true });
      }
      field.push({ key: "bankId", label: "Banca", sortable: true });
      this.rulesFields = field;
      //const httpService = new HttpManager();
      let info = getServiceInfo(GET_RULES);
      info.query.type = this.messageType;
      new HttpManager()
        .callNodeServer(info)
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
  },
};
</script>

<style></style>
