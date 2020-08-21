<template>
  <div v-if="rule != null">
    <b-row>
      <b-col sm="2">
        <label class="font-weight-bold">{{
          rule.type === "SMS" ? "Orgine" : "Nome"
        }}</label>
      </b-col>
      <b-col sm="4">
        <label>
          {{ rule.key }}
        </label>
      </b-col>
      <b-col sm="2" v-if="rule.type === 'PUSH'">
        <label class="font-weight-bold">Identificativo</label>
      </b-col>
      <b-col sm="4" v-if="rule.type === 'PUSH'">
        <label>
          {{ rule.key2 }}
        </label>
      </b-col>
    </b-row>

    <b-card v-for="entry in rule.rules" :key="entry.ix">
      <b-row>
        <b-col sm="2">
          <b-row class="text-center">
            <b-button
              class="my-1"
              variant="primary"
              @click="manageButton('deleteB', entry.ix)"
            >
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
              <b-form-select
                v-model="entry.key"
                :options="attrTypeOptions"
                @change="checkField"
              ></b-form-select>
            </b-form-group>
            <b-form-group label="Obbligatorio" class="col-sm-3">
              <b-form-checkbox
                v-model="entry.mandatory"
                @change="checkField"
              ></b-form-checkbox>
            </b-form-group>
            <b-form-group
              label="Regola EXIST"
              class="col-sm-3"
              v-if="attrTypeProp[entry.key].exist === true"
            >
              <b-input
                v-model="entry.rule.exist"
                @change="checkField"
              ></b-input>
            </b-form-group>
            <b-form-group
              label="Testo che precede"
              class="col-sm-3"
              v-if="attrTypeProp[entry.key].exist === false"
            >
              <b-input
                v-model="entry.rule.before"
                @change="checkField"
              ></b-input>
            </b-form-group>
            <b-form-group
              label="Testo in coda"
              class="col-sm-3"
              v-if="attrTypeProp[entry.key].exist === false"
            >
              <b-input
                v-model="entry.rule.after"
                @change="checkField"
              ></b-input>
            </b-form-group>
            <b-form-group
              label="Valido se esiste"
              class="col-sm-3"
              v-if="attrTypeProp[entry.key].exist === false"
            >
              <b-input
                v-model="entry.rule.ifexist"
                @change="checkField"
              ></b-input>
            </b-form-group>
          </b-row>
        </b-col>
      </b-row>
    </b-card>
    <b-row class="ml-0">
      <b-button variant="primary" @click="annulla">Annulla</b-button>
      <b-button variant="primary" @click="updateRule(true)" class="ml-2"
        >Aggiungi regola</b-button
      >
      <b-button variant="primary" @click="updateRule(true)" class="ml-2"
        >Modifica regola</b-button
      >
      <b-button class="ml-2" variant="danger" @click="deleteRule(true)"
        >Elimina regola</b-button
      >
    </b-row>
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
  data: function() {
    return {
      rule: null,
      savedRule: {},
      attrTypeOptions: [],
      attrTypeProp: {},
      messageId: null,
    };
  },

  computed: {},
  beforeMount: function() {
    console.log(">>>> RuleDefinitionForm : beforeMount");
    this.resetConfiguration();
  },
  mounted: function() {
    console.log(">>>> RuleDefinitionForm : mounted");
    this.getRule();
    this.updateButton();
  },
  beforeUpdate: function() {
    console.log(">>>> RuleDefinitionForm : beforeUpdate");
    this.getRule();
    this.updateButton();
  },
  methods: {
    isVisible(key) {
      return true;
    },
    annulla() {
      this.$emit("updateRules");
    },
    addNewRule() {
      let rule = {
        rules: [{ key: "DATA", rule: {} }],
        bankId: null,
        type: this.message.type,
        key:
          this.message.type === "SMS"
            ? this.message.sender
            : this.message.packageName,
      };
      if (this.message.type === "SMS") rule.key2 = this.message.sender;
      this.rule = rule;
      this.savedRule = JSON.parse(JSON.stringify(this.rule));
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
          } else {
            this.annulla();
          }
        })
        .catch((err) => {
          console.error("Errore in display msgbox : " + err);
        });
    },
    checkField(event) {
      let change = false;
      if (change) {
        console.log("Check for changes ..");
        this.$emit("updateRules", this.model);
        this.tmpRules = JSON.parse(JSON.stringify(this.model));
      } else console.log("No changes found ..");
    },
    getRule() {
      // get rule from message or form id

      const httpService = new HttpMonitor();
      if (!this.checkNullInputData() && this.rule === null) {
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
    resetConfiguration() {
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
      //this.tmpRules = JSON.parse(JSON.stringify(this.model));
    },
    updateButton() {
      if (this.rule != null && this.rule.rules) {
        for (let ix = 0; ix < this.rule.rules.length; ix++) {
          this.rule.rules[ix].ix = ix;
        }
      }
    },
    manageButton(action, ix) {
      console.log("Button : " + action);
      console.log("Button : " + ix);
      let out = [];
      if (action === "addB" || action === "deleteB") {
        //
      }
      this.updateButton();
    },
  },
};
</script>
