<template>
  <div class="animated fadeIn">
    <div v-if="show === undefined">
      <b-button size="lg" class="float-right" variant="normal transparent p-0" right @click="showModalButtun">
        <i class="fa fa-cog"></i>
      </b-button>
    </div>
    <b-modal
      v-model="showModal"
      id="modalConfiguration"
      :title="model.title"
      @ok="updateConfiguration"
      @cancel="cancelConfiguration"
      :ok-disabled="tmpModalData.disable"
    >
      <b-form-group
        v-for="field in tmpModalData.model.fields"
        :key="field.id"
        label-cols-lg="6"
        :label-for="field.id"
        :label="field.label"
        :state="field.state"
        :invalid-feedback="intervalStateInvalidFeedback"
      >
        <div v-if="field.type == 'checkbox'">
          <b-form-checkbox :id="field.id" v-model="field.value" :placeholder="field.label"></b-form-checkbox>
        </div>
        <div v-else-if="field.type == 'radio'">
          <b-form-radio-group
            :id="field.id"
            v-model="field.value"
            :placeholder="field.label"
            :options="field.options"
          ></b-form-radio-group>
        </div>
        <div v-else-if="field.type == 'select'">
          <b-form-select
            :id="field.id"
            v-model="field.value"
            :placeholder="field.label"
            :options="field.options"
          ></b-form-select>
        </div>
        <div v-else>
          <b-form-input
            :id="field.id"
            v-model="field.value"
            required
            trim
            :no-wheel="false"
            :state="field.state"
            :type="field.type"
            @input.native="checkField"
          ></b-form-input>
        </div>
      </b-form-group>
    </b-modal>
  </div>
</template>
<script>
export default {
  name: "ModalConfiguration",
  props: ["model", "show"],
  data: function() {
    return {
      tmpModalData: { disable: false, windowsOpen: true },
      showButton: false,
      showModal: false,
    };
  },
  computed: {
    intervalStateInvalidFeedback() {
      console.log("Call intervalStateInvalidFeedback");
      return "Dato immesso non valido";
    },
  },
  beforeMount: function() {
    console.log(">>>> beforeMount : Load configuration..");
    this.resetConfiguration();
  },
  beforeUpdate: function() {
    console.log(">>>> beforeUpdate Load configuration..");
    if (this.show != undefined) {
      this.resetConfiguration();
      this.showModal = this.show;
    }
  },
  methods: {
    showModalButtun() {
      this.resetConfiguration();
      this.showModal = true;
    },
    checkField(event) {
      this._checkField(event.target.id);
    },
    _checkField(type) {
      var ok = true;
      console.log("Call checkField : " + type);
      for (var ix = 0; ix < this.tmpModalData.model.fields.length; ix++) {
        let field = this.tmpModalData.model.fields[ix];
        if (type === field.id) {
          console.log("Check ID " + type);
          if (field.type === "number") {
            if (field.min && field.value < field.min) ok = false;
            else if (field.max && field.value > field.max) ok = false;
            field.state = ok;
          } else {
            //TODO check other state
          }
        }
      }
      this.tmpModalData.disable = !ok;
    },
    cancelConfiguration() {
      this.$emit("updateConfiguration", []);
    },
    updateConfiguration() {
      console.log("Update configuration");
      var fields = [];
      for (var ix = 0; ix < this.tmpModalData.model.fields.length; ix++) {
        let field = this.tmpModalData.model.fields[ix];
        if (field.value != this.model.fields[ix].value) fields.push(field);
      }
      //if (fields.length > 0)
      this.$emit("updateConfiguration", fields);
    },
    resetConfiguration() {
      console.log("reset configuration");
      var modelOut = JSON.parse(JSON.stringify(this.model));
      this.tmpModalData.model = modelOut;
      this.tmpModalData.disable = false;
    },
  },
};
</script>
