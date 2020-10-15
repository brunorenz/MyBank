<template>
  <div>
    <ModalConfiguration
      :model="modalCfg"
      :show="showModal"
      v-on:updateConfiguration="selectRuleToManage"
    ></ModalConfiguration>

    <div v-if="rule != null">
      <b-row class="ml-0">
        <b-button variant="primary" @click="annulla">Annulla</b-button>
        <b-button variant="primary" @click="updateMessageRule(true)" class="ml-2" :disabled="!anyChange && !newRule">{{
          displayAdd
        }}</b-button>
        <b-button variant="primary" @click="duplicateRule(true)" class="ml-2" :disabled="newRule"
          >Duplica Regola</b-button
        >
        <b-button v-if="typeof message != 'undefined'" class="ml-2" variant="success" @click="testRule"
          >Simula Regola</b-button
        >
        <b-button class="ml-2" variant="danger" @click="deleteRule(true)" :disabled="newRule">Elimina Regola</b-button>
      </b-row>
      <b-row class="mt-2">
        <b-col sm="3">
          <label class="font-weight-bold">
            {{ rule.type === "SMS" ? "Orgine SMS" : "Nome pacchetto messaggio PUSH" }}
          </label>
        </b-col>
        <b-col sm="6">
          <label>{{ rule.key }}</label>
        </b-col>
      </b-row>
      <b-row class="mt-2" v-if="rule.type === 'PUSH'">
        <b-col sm="3">
          <label class="font-weight-bold">Identificativo</label>
        </b-col>
        <b-col sm="6">
          <label>{{ rule.key2 }}</label>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="3" class="mt-2">
          <label class="font-weight-bold">Valida se contiene</label>
        </b-col>
        <b-col sm="6">
          <b-input v-model="rule.validIf" @change="checkField()"></b-input>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="3" class="mt-2">
          <label class="font-weight-bold">Conto Base</label>
        </b-col>
        <b-col sm="6">
          <b-form-select v-model="rule.bankId" :options="accountOptions" @change="checkField()"></b-form-select>
        </b-col>
      </b-row>
      <b-row v-if="typeof message != 'undefined'" class="mt-2">
        <b-col sm="3">
          <label class="font-weight-bold">Messaggio d'esempio</label>
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
                <b-form-select
                  v-if="cfg.attrTypeProp[entry.key].exist != true"
                  v-model="entry.key"
                  :options="cfg.attrTypeOptions"
                  @change="checkField('TIPO')"
                ></b-form-select>
                <b-form-select
                  v-else
                  v-model="entry.key"
                  :options="cfg.attrTypeOptionsExist"
                  @change="checkField('TIPO')"
                ></b-form-select>
              </b-form-group>
              <b-form-group label="Obbligatorio" class="col-sm-3">
                <b-form-checkbox v-model="entry.mandatory" @change="checkField()"></b-form-checkbox>
              </b-form-group>
              <b-form-group label="Regola EXIST" class="col-sm-3" v-if="cfg.attrTypeProp[entry.key].exist === true">
                <b-input v-model="entry.rule.exist" @change="checkField()"></b-input>
              </b-form-group>
              <b-form-group
                label="Testo che precede"
                class="col-sm-3"
                v-if="cfg.attrTypeProp[entry.key].exist === false"
              >
                <b-input v-model="entry.rule.before" @change="checkField()"></b-input>
              </b-form-group>
              <b-form-group label="Numero occorrenze" class="col-sm-3" v-if="entry.rule.before != undefined">
                <b-input v-model="entry.rule.occurs" @change="checkField()"></b-input>
              </b-form-group>
              <b-form-group label="Testo in coda" class="col-sm-3" v-if="cfg.attrTypeProp[entry.key].exist === false">
                <b-input v-model="entry.rule.after" @change="checkField()"></b-input>
              </b-form-group>
              <b-form-group
                label="Valido se esiste"
                class="col-sm-3"
                v-if="cfg.attrTypeProp[entry.key].exist === false"
              >
                <b-input v-model="entry.rule.ifexist" @change="checkField()"></b-input>
              </b-form-group>
              <b-form-group
                label="Valore se non trovato"
                class="col-sm-3"
                v-if="cfg.attrTypeProp[entry.key].ifnull === true"
              >
                <b-input v-model="entry.rule.ifnull" @change="checkField()"></b-input>
              </b-form-group>
              <b-form-group label="Pattern" class="col-sm-3" v-if="cfg.attrTypeProp[entry.key].pattern === true">
                <b-input v-model="entry.rule.pattern" @change="checkField()"></b-input>
              </b-form-group>
            </b-row>
          </b-col>
        </b-row>
      </b-card>
      <b-row class="ml-0">
        <b-button variant="primary" @click="annulla">Annulla</b-button>
        <b-button variant="primary" @click="updateMessageRule(true)" class="ml-2" :disabled="!anyChange && !newRule">{{
          displayAdd
        }}</b-button>
        <b-button v-if="typeof message != 'undefined'" class="ml-2" variant="success" @click="testRule"
          >Simula Regola</b-button
        >
        <b-button class="ml-2" variant="danger" @click="deleteRule(true)" :disabled="newRule">Elimina Regola</b-button>
      </b-row>
      <b-modal
        v-model="showModalAddRule"
        id="modalAddRule"
        title="Seleziona la tipologia di regola da inserire"
        @ok="addNewRule"
      >
        <div>
          <b-form-group label="Tipo Regola" class="col-sm-6">
            <b-form-radio-group v-model="ruleType" :options="ruleTypeOptions"></b-form-radio-group>
          </b-form-group>
        </div>
      </b-modal>
      <b-modal v-model="showModalTestRule" id="modalTestRule" title="Esito Simulazione Regola">
        <div>
          <b-row>
            <b-col sm="6">accettata</b-col>
            <b-col sm="6">
              <strong :style="esitoTestRegola.accepted === true ? 'color: green;' : 'color: red;'">{{
                esitoTestRegola.accepted
              }}</strong>
            </b-col>
          </b-row>
          <b-row>
            <b-col sm="6">banca</b-col>
            <b-col sm="6">
              <strong>{{ esitoTestRegola.bankId }}</strong>
            </b-col>
          </b-row>
          <b-row v-for="attr in cfg.attrTypeOptions" :key="attr.value">
            <b-col sm="6" v-if="ruleByKey[attr.value] != null">{{ attr.valueLC }}</b-col>
            <b-col sm="6" v-if="ruleByKey[attr.value] != null">
              <strong>{{ esitoTestRegola[attr.valueLC] }}</strong>
            </b-col>
          </b-row>
          <b-row v-for="attr in cfg.attrTypeOptionsExist" :key="attr.value">
            <b-col sm="6" v-if="ruleByKey[attr.value] != null">{{ attr.valueLC }}</b-col>
            <b-col sm="6" v-if="ruleByKey[attr.value] != null">
              <strong>{{ esitoTestRegola[attr.valueLC] }}</strong>
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
  </div>
</template>

<script>
import ModalConfiguration from "@/components/common/ModalConfiguration";
import HttpManager from "@/services/HttpManager";
import {
  ADD_RULE,
  UPDATE_RULE,
  TEST_RULE,
  GET_RULES,
  GET_CONFIGURATION,
  getServiceInfo,
} from "@/services/restServices";
import { showMsgEsitoEsecuzione, showMsgErroreEsecuzione, showConfirmationMessage } from "@/services/utilities";
export default {
  name: "RuleDefinitionForm",
  props: ["ruleId", "message"],
  components: { ModalConfiguration },
  data: function() {
    return {
      rule: null,
      ruleByKey: {},
      savedRule: {},
      cfg: {},
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
      account: "",
      accountOptions: [],
      modalCfg: {
        title: "Seleziona Regala da Aggiornare",
        fields: [],
      },
      showModal: false,
      savedRules: undefined,
    };
  },
  computed: {
    displayAdd: function() {
      return this.newRule ? "Aggiungi Regola" : "Aggiorna Regola";
    },
  },
  beforeMount: function() {
    console.log(">>>> RuleDefinitionForm : beforeMount");
    this.getMyBankConfiguration();
  },
  mounted: function() {
    console.log(">>>> RuleDefinitionForm : mounted");
    this.getRule();
  },
  beforeUpdate: function() {
    console.log(">>>> RuleDefinitionForm : beforeUpdate");
  },
  methods: {
    displayTest(key) {
      let dis = this.ruleByKey[key] != null;
      return dis;
    },
    duplicateRule(confirm) {
      if (confirm != undefined) {
        showConfirmationMessage(this, "Confermi la duplicazione della regola ?", this.duplicateRule);
      } else {
        delete this.rule["_id"];
        this.newRule = true;
      }
    },
    updateMessageRule(confirm) {
      let add = typeof this.rule._id === "undefined";
      if (typeof confirm != "undefined") {
        showConfirmationMessage(
          this,
          "Confermi " + (add ? "inserimento" : "aggiornamento") + " della regola ?",
          this.updateMessageRule
        );
      } else {
        // valida rule
        for (let ix = 0; ix < this.rule.rules.length; ix++) {
          let r = this.rule.rules[ix];
          if (typeof this.cfg.attrTypeProp[r.key].type != "undefined") {
            this.rule.rules[ix].rule.type = this.cfg.attrTypeProp[r.key].type;
          } else this.rule.rules[ix].rule.type = undefined;
        }
        const httpService = new HttpManager();
        let info = getServiceInfo(add ? ADD_RULE : UPDATE_RULE);
        info.request = this.rule;
        httpService
          .callNodeServer(info)
          .then((response) => {
            var data = response.data;
            let esito = data.error;
            if (esito.code === 0) {
              // update msg id
              this.rule._id = data.data._id;
              this.savedRule = JSON.stringify(this.rule);
              this.checkField();
            } else showMsgErroreEsecuzione(this);
          })
          .catch((error) => {
            showMsgErroreEsecuzione(this, error);
          });
      }
    },
    getMyBankConfiguration() {
      const httpService = new HttpManager();
      let info = getServiceInfo(GET_CONFIGURATION);
      httpService
        .callNodeServer(info)
        .then((response) => {
          let cfg = {};
          let a = [];
          var data = response.data;
          let esito = data.error;
          if (esito.code === 0) {
            let d = data.data;
            for (let ix = 0; ix < d.accounts.length; ix++) {
              a.push({
                value: d.accounts[ix].bankKey,
                text: d.accounts[ix].bankName + " - " + d.accounts[ix].description,
              });
            }

            this.accountOptions = a;
            // manage rules
            //let cfg = getConfiguration();
            //this.ruleDefinitions = cfg.ruleDefinitions;
            cfg.attrTypeOptions = [];
            cfg.attrTypeOptionsExist = [];
            cfg.attrTypeProp = {};
            for (let ix = 0; ix < d.rulesDefinition.length; ix++) {
              let r = d.rulesDefinition[ix];
              let entry = {
                value: r.key,
                text: r.key,
                valueLC: r.key.toLowerCase(),
              };
              if (r.exist) cfg.attrTypeOptionsExist.push(entry);
              else cfg.attrTypeOptions.push(entry);
              cfg.attrTypeProp[r.key] = {
                exist: r.exist,
                type: r.type,
                pattern: r.pattern,
                ifnull: typeof r.ifnull === "undefined" ? false : r.ifnull,
              };
            }
            this.cfg = cfg;
          }
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error);
        });
    },
    annulla(confirm) {
      // check any changes ?
      if (typeof confirm != "undefined") {
        let r = JSON.stringify(this.rule);
        if (r != this.savedRule) {
          showConfirmationMessage(this, "Confermi l'annullamento delle modifiche apportate ?", this.annulla);
        } else this.$emit("updateRules");
      } else this.$emit("updateRules");
    },
    initNewRule() {
      let rule = {
        rules: [],
        bankId: null,
        type: this.message.type,
        key: this.message.type === "SMS" ? this.message.sender : this.message.packageName,
      };
      if (this.message.type === "PUSH") rule.key2 = this.message.sender;
      this.rule = rule;
      this.ruleType = "base";
      this.addNewRule();
      this.savedRule = JSON.stringify(this.rule);
      this.updateFormData();
    },
    addNewRule() {
      let r = {};
      if (this.ruleType === "exist") {
        r = { key: "BANCOMAT", rule: { exist: "Exist Rule" } };
      } else {
        r = { key: "DATA", rule: {} };
      }
      if (typeof this.rule != "undefined" && this.rule != null) this.rule.rules.push(r);
      this.updateFormData();
    },
    checkNullInputData() {
      let nullData = typeof this.message === "undefined" || this.message === null;
      if (nullData) nullData = typeof this.ruleId === "undefined" || this.ruleId === null;
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
            this.initNewRule();
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
      console.log("Check Filed event : " + event);
      let s = JSON.stringify(this.rule);
      this.anyChange = s != this.savedRule;
    },
    testRule() {
      // aggiorna configurazione
      this.updateFormData();
      const httpService = new HttpManager();
      let info = getServiceInfo(TEST_RULE);
      info.request = {
        rule: this.rule,
        message: this.message,
      };
      httpService
        .callNodeServer(info)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          this.esitoTestRegola = data.data;
          this.showModalTestRule = true;
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error);
        });
    },
    getRule() {
      // get rule from message or form id
      // this.ruleId, this.messageId
      if (!this.checkNullInputData()) {
        const httpService = new HttpManager();
        let info = getServiceInfo(GET_RULES);
        if (typeof this.ruleId != "undefined" && this.ruleId != null) info.query.idRule = this.ruleId;
        else if (typeof this.messageId != "undefined" && this.messageId != null) info.query.idMessage = this.messageId;
        httpService
          .callNodeServer(info)
          .then((response) => {
            var data = response.data;
            let esito = data.error;
            if (esito.code === 0) {
              if (data.data.length > 0) {
                this.selectRuleToDisplay(data.data);
              } else this.confermaNuovaRegola();
            } else {
              showMsgErroreEsecuzione(this);
            }
          })
          .catch((error) => {
            showMsgErroreEsecuzione(this, error);
          });
      }
    },
    selectRuleToManage(values) {
      this.showModal = false;
      let ix = values.length === 0 ? 0 : values[0].value;
      this.selectRuleToDisplay([this.savedRules[ix]]);
    },
    selectRuleToDisplay(rules) {
      if (rules.length > 1) {
        this.savedRules = rules;
        let options = [];
        for (let ix = 0; ix < rules.length; ix++) {
          let vif = "";
          if (rules[ix].validIf && rules[ix].validIf != null) vif = rules[ix].validIf;
          options.push({ text: vif, value: ix });
        }
        this.fieldCategoria = {
          label: "Valida se contiene",
          type: "select",
          value: 0,
          options: options,
        };
        this.modalCfg.fields = [this.fieldCategoria];
        this.showModal = true;
      } else {
        this.rule = rules[0];
        this.rule.rules = this.validateRules(this.rule.rules);
        this.updateFormData();
        this.savedRule = JSON.stringify(this.rule);
      }
    },
    validateRules(rules) {
      let outrule = [];
      for (let ix = 0; ix < rules.length; ix++)
        if (typeof this.cfg.attrTypeProp[rules[ix].key] != "undefined") outrule.push(rules[ix]);
      return outrule;
    },
    // createConfigurationData() {
    //   let cfg = getConfiguration();
    //   this.ruleDefinitions = cfg.ruleDefinitions;
    //   let o = [];
    //   let oe = [];
    //   let p = {};
    //   for (let ix = 0; ix < cfg.ruleDefinitions.length; ix++) {
    //     let r = cfg.ruleDefinitions[ix];
    //     let entry = {
    //       value: r.key,
    //       text: r.key,
    //       valueLC: r.key.toLowerCase(),
    //     };
    //     if (r.exist) oe.push(entry);
    //     else o.push(entry);
    //     p[r.key] = {
    //       exist: r.exist,
    //       type: r.type,
    //       pattern: r.pattern,
    //     };
    //   }
    //   this.attrTypeOptionsExist = oe;
    //   this.attrTypeOptions = o;
    //   this.attrTypeProp = p;
    // },
    updateFormData() {
      console.log("Update updateFromData ..");
      // create buttun index
      if (typeof this.rule != "undefined" && this.rule != null) {
        for (let ix = 0; ix < this.rule.rules.length; ix++) {
          this.rule.rules[ix].ix = ix;
        }
        let r = {};
        for (let ix = 0; ix < this.rule.rules.length; ix++) r[this.rule.rules[ix].key] = this.rule.rules[ix];
        this.ruleByKey = r;
      }
    },
    manageButton(action, ix) {
      console.log("Button : " + action);
      console.log("Button : " + ix);
      let out = [];
      if (action === "addB") {
        this.showModalAddRule = true;
      } else if (action === "deleteB") {
        //
      }
    },
  },
};
</script>
