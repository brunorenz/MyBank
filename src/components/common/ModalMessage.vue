<template>
  <div class="animated fadeIn">
    <b-modal
      v-model="showModalMessageDetail"
      id="modalMessageDetail"
      :title="title"
      @ok="updateConfiguration"
      @cancel="cancelConfiguration"
      @close="cancelConfiguration"
      @hide="cancelConfiguration"
      :ok-only="updateMsg === false"
    >
      <div>
        <b-row>
          <b-col class="font-weight-bold col-sm-4">Tipo Messaggio </b-col>
          <b-col>{{ msgDet.type }} </b-col>
        </b-row>
        <b-row class="mt-2">
          <b-col class="font-weight-bold col-sm-4">Mittente</b-col>
          <b-col>{{ msgDet.sender }} </b-col>
        </b-row>
        <b-row class="mt-2" v-if="msgDet.type == 'PUSH'">
          <b-col class="font-weight-bold col-sm-4">Nome Pacchetto </b-col>
          <b-col>{{ msgDet.packageName }} </b-col>
        </b-row>
        <b-row class="mt-2">
          <b-col class="font-weight-bold col-sm-4">Data Invio </b-col>
          <b-col v-if="updateMsg === false">{{ msgDet.dateDisplay }} </b-col>
          <b-col v-else>
            <b-form-datepicker v-model="msgDet.dateDisplay" locale="it"></b-form-datepicker>
          </b-col>
        </b-row>
        <b-row class="mt-2">
          <b-col class="font-weight-bold col-sm-4">Messaggio </b-col>
          <b-col v-if="updateMsg === false">{{ msgDet.message }} </b-col>
          <b-col v-else>
            <b-form-textarea
              v-model="msgDet.message"
              required
              trim
              :no-wheel="false"
              :state="state.message"
              rows="4"
              max-rows="4"
              @input.native="checkField"
            ></b-form-textarea>
          </b-col>
        </b-row>
      </div>
    </b-modal>
  </div>
</template>
<script>
export default {
  name: "ModalMessage",
  props: ["msgDet", "show", "update"],
  data: function() {
    return {
      tmpModalData: { disable: false, windowsOpen: true },
      showButton: false,
      showModalMessageDetail: false,
      updateMsg: false,
      title: "",
      state: {
        message: true,
        date: true,
      },
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
      this.showModalMessageDetail = this.show;
    }
  },
  methods: {
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
      if (this.showModalMessageDetail) {
        this.showModalMessageDetail = false;
        this.$emit("updateMessage", []);
      }
    },
    updateConfiguration() {
      var fields = [];
      if (this.updateMsg) {
        for (var ix = 0; ix < this.tmpModalData.model.fields.length; ix++) {
          let field = this.tmpModalData.model.fields[ix];
          if (field.value != this.model.fields[ix].value) fields.push(field);
        }
      }
      this.$emit("updateMessage", fields);
    },
    resetConfiguration() {
      console.log("reset configuration");
      // aggiorno ora prima di fare copia
      this.msgDet.dateDisplay = this.$moment(this.msgDet.time).format("DD/MM/YYYY hh:MM");
      var modelOut = JSON.parse(JSON.stringify(this.msgDet));
      this.updateMsg = this.update === undefined ? false : this.update;
      this.title = this.updateMsg ? "Duplica " : " Dettaglio ";
      this.title = this.title + (modelOut.type === "SMS" ? "Messaggio SMS" : "Notifica PUSH");
      this.tmpModalData.model = modelOut;
    },
  },
};
</script>
