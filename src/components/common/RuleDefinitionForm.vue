<template>
  <div v-if="rule != null">
    <b-row>
      <b-col sm="3">
        <label class="font-weight-bold">
          {{
          rule.type === "SMS" ? "Orgine SMS" : "Nome pacchetto messaggio PUSH"
          }}
        </label>
      </b-col>
      <b-col sm="6">
        <label>{{ rule.key }}</label>
      </b-col>
    </b-row>
    <b-row v-if="rule.type === 'PUSH'">
      <b-col sm="3">
        <label class="font-weight-bold">Identificativo</label>
      </b-col>
      <b-col sm="6">
        <label>{{ rule.key2 }}</label>
      </b-col>
    </b-row>
    <b-row v-if="typeof message != 'undefined'">
      <b-col sm="3">
        <label class="font-weight-bold">Messaggio</label>
      </b-col>
      <b-col>
        <label>{{ message.message }}</label>
      </b-col>
    </b-row>

    <b-card v-for="entry in rule.rules" :key="entry.ix">
      <b-row>
        <b-col sm="2">
          <b-row class="text-center">
            <b-button class="my-1" variant="primary" @click="manageButton('deleteB', entry.ix)">
              <b-icon icon="trash"></b-icon>
            </b-button>
            <b-button
              v-if="entry.ix === rule.rules.length - 1"
              class="mx-1 my-1"
              variant="primary"
              @click="manageButton('addB', entry.ix)"
            >
              <b-icon icon="plus"></b-icon>
            </b-button>
          </b-row>
        </b-col>
        <b-col>
          <b-row>
            <b-form-group label="Tipo attributo" class="col-sm-3">
              <b-form-select v-model="entry.key" :options="attrTypeOptions" @change="checkField"></b-form-select>
            </b-form-group>
            <b-form-group label="Obbligatorio" class="col-sm-3">
              <b-form-checkbox v-model="entry.mandatory" @change="checkField"></b-form-checkbox>
            </b-form-group>
            <b-form-group
              label="Regola EXIST"
              class="col-sm-3"
              v-if="attrTypeProp[entry.key].exist === true"
            >
              <b-input v-model="entry.rule.exist" @change="checkField"></b-input>
            </b-form-group>
            <b-form-group
              label="Testo che precede"
              class="col-sm-3"
              v-if="attrTypeProp[entry.key].exist === false"
            >
              <b-input
                v-model="entry.rule.before"
                @change="checkField"
                @update="updateField(entry.ix)"
              ></b-input>
            </b-form-group>
            <b-form-group
              label="Testo in coda"
              class="col-sm-3"
              v-if="attrTypeProp[entry.key].exist === false"
            >
              <b-input v-model="entry.rule.after" @change="checkField"></b-input>
            </b-form-group>
            <b-form-group
              label="Valido se esiste"
              class="col-sm-3"
              v-if="attrTypeProp[entry.key].exist === false"
            >
              <b-input v-model="entry.rule.ifexist" @change="checkField"></b-input>
            </b-form-group>
          </b-row>
        </b-col>
      </b-row>
    </b-card>
    <b-row class="ml-0">
      <b-button variant="primary" @click="annulla">Annulla</b-button>
      <b-button
        variant="primary"
        @click="updateRule(true)"
        class="ml-2"
        :disabled="!anyChange && !newRule"
      >{{ displayAdd }}</b-button>
      <b-button
        v-if="typeof message != 'undefined'"
        class="ml-2"
        variant="success"
        @click="testRule"
      >Simula Regola</b-button>
      <b-button
        class="ml-2"
        variant="danger"
        @click="deleteRule(true)"
        :disabled="newRule"
      >Elimina Regola</b-button>
    </b-row>
    <b-modal v-model="showModalAddRule" id="modalAddRule" title="Selezione Tipo Regola" @ok="addNewRule">
      <b-form-group label="Tipo Regola" class="col-sm-6">
        <b-form-radio-group id="messageTypeId" v-model="ruleType" :options="ruleTypeOptions"></b-form-radio-group>
      </b-form-group>
    </b-modal>
    <b-modal v-model="showModalTestRule" id="modalTestRule" title="Esito Simulazione Regola">
      <div>
        <b-row>
          <b-col sm="6">Accettata</b-col>
          <b-col sm="6">
            <strong>{{ esitoTestRegola.accepted }}</strong>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="6">Banca</b-col>
          <b-col sm="6">
            <strong>{{ esitoTestRegola.bankId }}</strong>
          </b-col>
        </b-row>
        <b-row v-if="ruleByKey['DATA'] != null">
          <b-col sm="6">Data</b-col>
          <b-col sm="6">
            <strong>{{ esitoTestRegola.data }}</strong>
          </b-col>
        </b-row>
        <b-row v-if="ruleByKey['IMPORTO'] != null">
          <b-col sm="6">Importo</b-col>
          <b-col sm="6">
            <strong>{{ esitoTestRegola.importo }}</strong>
          </b-col>
        </b-row>
      </div>
      <template v-slot:modal-footer>
        <div>
          <b-button variant="primary" class="float-right" @click="showModalTestRule = false">Chiudi</b-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { getConfiguration } from "@/services/config";
import HttpMonitor from "@/services/httpMonitorRest";
import {
  showMsgEsitoEsecuzione,
  showMsgErroreEsecuzione,
  showConfirmationMessage,
} from "@/services/utilities";
export default {
  name: "RuleDefinitionForm",
  props: ["ruleId", "message"],
  data: function () {
    return {
      rule: null,
      ruleByKey: {},
      savedRule: {},
      attrTypeOptions: [],
      attrTypeProp: {},
      messageId: null,
      anyChange: false,
      newRule: false,
      showModalTestRule: false,
      esitoTestRegola: {},
      showModalAddRule: false,
      ruleType: "base",      
      ruleTypeOptions: [
        { text: "Regala base", value: "base" },
        { text: "Regola exist", value: "exist" },
      ],
    };
  },
  computed: {
    rulen: function () {
      console.log("Process ruleId : " + this.ruleId);
      console.log("Process message : " + this.message);
      return this.rule;
    },
    displayAdd: function () {
      return this.newRule ? "Aggiungi Regola" : "Aggiorna Regola";
    },
  },
  beforeMount: function () {
    console.log(">>>> RuleDefinitionForm : beforeMount");
    this.createConfigurationData();
  },
  mounted: function () {
    console.log(">>>> RuleDefinitionForm : mounted");
    this.getRule();
    this.updateFormData();
  },
  beforeUpdate: function () {
    console.log(">>>> RuleDefinitionForm : beforeUpdate");
    //this.updateButton();
  },
  methods: {
    // updateRuleByKey() {
    //   let r = {};
    //   for (let ix = 0; ix < this.rule.rules.length; ix++)
    //     r[this.rule.rules[ix].key] = this.rule.rules[ix];
    //   this.ruleByKey = r;
    // },
    displayTest(key) {
      let dis = this.ruleByKey[key] != null;
      return dis;
    },
    annulla(confirm) {
      // check any changes ?
      if (typeof confirm != "undefined") {
        let r = JSON.stringify(this.rule);
        let r1 = JSON.stringify(this.savedRule);
        if (r != r1) {
          showConfirmationMessage(
            this,
            "Confermi l'annullamento delle modifiche apportate ?",
            this.annulla
          );
        } else this.$emit("updateRules");
      } else this.$emit("updateRules");
    },
    addNewRule(type) {
      let rule = {
        rules: [{ key: "DATA", rule: {} }],
        bankId: null,
        type: this.message.type,
        key:
          this.message.type === "SMS"
            ? this.message.sender
            : this.message.packageName,
      };
      if (typeof type != "undefined" && type === "exist")
        rule.rules[0].exist = "Exist Rule";
      if (this.message.type === "SMS") rule.key2 = this.message.sender;
      this.rule = rule;
      this.savedRule = JSON.parse(JSON.stringify(this.rule));
      this.updateFormData();
    },
    checkNullInputData() {
      let nullData =
        typeof this.message === "undefined" || this.message === null;
      if (nullData)
        nullData = typeof this.ruleId === "undefined" || this.ruleId === null;
      else this.messageId = this.message._id;
      return nullData;
    },
    confermaNuovaRegola() {
      let options = {
        title: "Confermi Operazione",
        okVariant: "success",
        cancelVariant: "danger",
        footerClass: "p-2 border-top-0",
        centered: true,
      };
      this.$bvModal
        .msgBoxConfirm("Comfermi l'inserimento di una nuova regola ?", options)
        .then((value) => {
          if (value) {
            this.addNewRule();
            this.newRule = true;
          } else {
            this.annulla();
          }
        })
        .catch((err) => {
          console.error("Errore in display msgbox : " + err);
        });
    },
    updateField(event) {
      this.anyChange = true;
    },
    checkField(event) {
      this.anyChange = true;
    },
    testRule() {
      const httpService = new HttpMonitor();
      httpService
        .testMessageRule(this.rule, this.message)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          this.esitoTestRegola = data.data;
          this.showModalTestRule = true;
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error, "testMessageRule");
        });
    },
    getRule() {
      // get rule from message or form id

      const httpService = new HttpMonitor();
      if (!this.checkNullInputData()) {
        httpService
          .getMessageRuleById(this.ruleId, this.messageId)
          .then((response) => {
            var data = response.data;
            let esito = data.error;
            if (esito.code === 0) {
              if (data.data.length > 0) {
                this.rule = data.data[0];
                this.savedRule = JSON.parse(JSON.stringify(this.rule));
              } else this.confermaNuovaRegola();
            } else {
              showMsgErroreEsecuzione(this, esito, "getMessageRuleById");
            }
          })
          .catch((error) => {
            showMsgErroreEsecuzione(this, error, "getMessageRuleById");
          });
      }
    },
    createConfigurationData() {
      let cfg = getConfiguration();
      this.ruleDefinitions = cfg.ruleDefinitions;
      let o = [];
      let p = {};
      for (let ix = 0; ix < cfg.ruleDefinitions.length; ix++) {
        let r = cfg.ruleDefinitions[ix];
        o.push({
          value: r.key,
          text: r.key,
        });
        p[r.key] = {
          exist: r.exist,
          type: r.type,
          pattern: r.pattern,
        };
      }
      this.attrTypeOptions = o;
      this.attrTypeProp = p;
    },
    updateFormData() {
      console.log("Update updateFromData ..");
      // create buttun index
      if (typeof this.rule != "undefined" && this.rule != null) {
        if (this.rule != null && this.rule.rules) {
          for (let ix = 0; ix < this.rule.rules.length; ix++) {
            this.rule.rules[ix].ix = ix;
          }
        }
        // create test modal strutture
        let r = {};
        for (let ix = 0; ix < this.rule.rules.length; ix++)
          r[this.rule.rules[ix].key] = this.rule.rules[ix];
        this.ruleByKey = r;
      }
    },
    manageButton(action, ix) {
      console.log("Button : " + action);
      console.log("Button : " + ix);
      let out = [];
      if (action === "addB") {
        //
        this.showModalAddRule = true;
      } else if (action === "deleteB") {
        //
      }
      this.updateFormData();
    },
  },
};
</script>
