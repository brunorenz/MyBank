<template>
  <div class="animated fadeIn">
    <b-modal
      v-model="showModal"
      id="modalMessageDetail"
      :title="title"
      :nonCancellare="show"
      no-close-on-backdrop
      @ok="updateConfiguration"
      @hide="cancelConfiguration"
      :ok-only="updateMsg === false"
      :ok-disabled="!anyChange || anyError"
    >
      <div>
        <b-row>
          <b-col class="font-weight-bold col-sm-4">Tipo Messaggio </b-col>
          <b-col>{{ saveMsgDet.type }} </b-col>
        </b-row>
        <b-row class="mt-2">
          <b-col class="font-weight-bold col-sm-4">Mittente</b-col>
          <b-col>{{ saveMsgDet.sender }} </b-col>
        </b-row>
        <b-row class="mt-2" v-if="saveMsgDet.type == 'PUSH'">
          <b-col class="font-weight-bold col-sm-4">Nome Pacchetto </b-col>
          <b-col>{{ saveMsgDet.packageName }} </b-col>
        </b-row>
        <b-row class="mt-2">
          <b-col class="font-weight-bold col-sm-4">Data Invio </b-col>
          <b-col v-if="updateMsg === false">{{ saveMsgDet.dateDisplay }} </b-col>
          <b-col v-else>
            <b-form-datepicker
              id="date"
              v-model="saveMsgDet.date"
              :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }"
              required
              value-as-date
              locale="it"
              @input="checkFieldData"
            ></b-form-datepicker>
          </b-col>
        </b-row>
        <b-row class="mt-2">
          <b-col class="font-weight-bold col-sm-4">Messaggio </b-col>
          <b-col v-if="updateMsg === false">{{ saveMsgDet.message }} </b-col>
          <b-col v-else>
            <b-form-textarea
              id="message"
              v-model="saveMsgDet.message"
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
      saveMsgDet: {},
      showModal: false,
      updateMsg: false,
      title: "",
      state: {
        message: true,
        date: true,
      },
      firstTime: true,
    };
  },
  computed: {
    anyChange() {
      if (this.saveMsgDet.message) {
        let f = this.msgDet.message != this.saveMsgDet.message;
        if (!f) {
          let f1 = parseInt(this.saveMsgDet.date.getTime() / 100000);
          let f2 = parseInt(this.msgDet.time / 100000);
          console.log(f1 + " = " + f2);
        }
        console.log("AnyChange : " + f);
        return f;
      }
      return false;
    },
    anyError() {
      let f = !(this.state.message && this.state.date);
      console.log("AnyError : " + f);
      return f;
    },
  },
  beforeUpdate: function() {
    console.log(">>>> beforeUpdate Load configuration.. : " + this.show);
    if (this.show != undefined) {
      if (this.firstTime && this.show) {
        this.resetConfiguration();
        this.firstTime = false;
      }
      this.showModal = this.show;
    }
  },
  methods: {
    checkFieldData() {
      this._checkField("date");
    },
    checkField(event) {
      this._checkField(event.target.id);
    },
    _checkField(type) {
      var ok = true;
      console.log("Call checkField : " + type);
      if (type === "date") {
        //
        let t = this.saveMsgDet.date.getTime();
        console.log("new Time " + t + " - old " + this.msgDet.time);
      } else if (type === "message") {
        //
        this.state.message = this.saveMsgDet.message != "";
      }
    },
    cancelConfiguration() {
      if (this.showModal) {
        this.showModal = false;
        this.firstTime = true;
        this.$emit("updateMessage", {});
      }
    },
    updateConfiguration() {
      var fields = {};
      if (this.updateMsg) {
        fields = {
          message: this.saveMsgDet.message,
          date: this.saveMsgDet.date,
        };
      }
      this.showModal = false;
      this.firstTime = true;
      this.$emit("updateMessage", fields);
    },
    resetConfiguration() {
      console.log("reset configuration : " + this.show);
      //      if (this.show) {
      // aggiorno ora prima di fare copia
      this.msgDet.date = new Date(this.msgDet.time);
      var modelOut = JSON.parse(JSON.stringify(this.msgDet));
      // imposto oggetto date
      modelOut.date = this.msgDet.date;
      modelOut.dateDisplay = this.$moment(modelOut.date).format("DD/MM/YYYY");
      this.updateMsg = this.update === undefined ? false : this.update;
      this.title = this.updateMsg ? "Duplica " : " Dettaglio ";
      this.title = this.title + (modelOut.type === "SMS" ? "Messaggio SMS" : "Notifica PUSH");
      this.saveMsgDet = modelOut;
      //      }
    },
  },
};
</script>
