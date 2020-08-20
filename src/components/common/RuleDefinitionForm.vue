<template>
  <div>
    <b-card v-for="entry in model" :key="entry.ix">
      <b-row>
        <b-col sm="2">
          <b-row class="text-center">
            <b-button
              class="mx-1 my-1"
              variant="primary"
              @click="manageButton('addB', entry.ix)"
            >
              <b-icon icon="plus"></b-icon>
            </b-button>
            <b-button
              class="my-1"
              variant="primary"
              @click="manageButton('deleteB', entry.ix)"
            >
              <b-icon icon="trash"></b-icon>
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
  </div>
</template>
<script>
import { getConfiguration } from "@/services/config";
export default {
  name: "RuleDefinitionForm",
  props: ["model", "type"],
  data: function() {
    return {
      tmpRules: {},
      attrTypeOptions: [],
      attrTypeProp: {},
    };
  },

  computed: {},
  beforeMount: function() {
    console.log(
      ">>>> RuleDefinitionForm : beforeMount : reset configuration.."
    );
    this.resetConfiguration();
  },
  mounted: function() {
    console.log(">>>> RuleDefinitionForm : mounted");
  },
  beforeUpdate: function() {
    console.log(">>>> RuleDefinitionForm : beforeUpdate..");
    this.updateButton();
  },
  methods: {
    isVisible(key) {
      return true;
    },
    checkField(event) {
      let change = false;
      if (this.model.length != this.tmpRules.length) change = true;
      else {
        // for (let ix = 0; ix < this.model.prog.length; ix++) {
        //   let rec = this.model.prog[ix];
        //   let recSave = this.tmpRules.prog[ix];
        //   let ts = this.getNumFromData(new Date(rec.oraOn));
        //   let te = this.getNumFromData(new Date(rec.oraOff));
        //   rec.timeStart = ts;
        //   rec.timeEnd = te;
        //   change =
        //     change ||
        //     rec.minLight != recSave.minLight ||
        //     rec.minTemp != recSave.minTemp ||
        //     rec.timeStart != recSave.timeStart ||
        //     rec.timeEnd != recSave.timeEnd ||
        //     rec.priorityDisp != recSave.priorityDisp;
        // }
      }
      if (change) {
        console.log("Check for changes ..");
        this.$emit("updateRules", this.model);
        this.tmpRules = JSON.parse(JSON.stringify(this.model));
      } else console.log("No changes found ..");
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
      this.tmpRules = JSON.parse(JSON.stringify(this.model));
    },
    updateButton() {
      // if (typeof this.model != "undefined" && this.model != null)
      //   for (let ix = 0; ix < this.model.length; ix++) {
      //     this.model.ix = ix;
      //     // let rec = this.model.prog[ix];
      //     // rec.up = ix === 0;
      //     // rec.down = ix === this.model.prog.length - 1;
      //   }
    },
    manageButton(action, ix) {
      console.log("Button : " + action);
      console.log("Button : " + ix);
      let out = [];
      if (action === "addB" || action === "deleteB") {
        // add
        for (let i = 0; i < this.model.prog.length; i++) {
          if (i === ix) {
            if (action === "addB") {
              out.push(this.model.prog[i]);
              out.push(JSON.parse(JSON.stringify(this.model.prog[i])));
            }
          } else out.push(this.model.prog[i]);
        }
        this.model.prog = out;
      }
      // rebuild index
      for (let i = 0; i < this.model.prog.length; i++)
        this.model.prog[i].ix = i;
      this.checkField();
    },
  },
};
</script>
