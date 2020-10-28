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
      :ok-disabled="(!anyChange || anyError) && action > 0"
    >
      <div>
        <b-row>
          <b-col class="font-weight-bold col-sm-4">Tipo Origine Messaggio </b-col>
          <b-col>{{ saveMsgDet.type }} </b-col>
        </b-row>
        <b-row class="mt-2">
          <b-col class="font-weight-bold col-sm-4">Mittente</b-col>
          <b-col>{{ saveMsgDet.sender }} </b-col>
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
  name: "ModalMovement",
  props: ["msgDet", "show", "action", "configuration"],
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
      if (this.action === 1) {
        let f = this.msgDet.bankId != this.saveMsgDet.bankId;
        return f;
      } else if (this.action === 2) {
        return true;
      }
      return false;
    },
    anyError() {
      let f = !(this.state.bankId && this.state.date);
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
      this.showModal = false;
      this.firstTime = true;
      this.$emit("updateMessage", this.saveMsgDet);
    },
    getDateFromStringIt(inDate) {
      var pattern = /(\d{2})\/(\d{2})\/(\d{4})/;
      let a = inDate.replace(pattern, "$3-$2-$1");
      return new Date(a);
    },

    resetConfiguration() {
      // action 0 -read , 1 - update , 2 - insert
      debugger;
      console.log("reset configuration : " + this.show);
      this.updateMsg = this.action != 0; // === 0 ? false : this.update;
      this.saveMsgDet = JSON.parse(JSON.stringify(this.msgDet));
      this.title = "Dettaglio Movimento";
      if (this.action === 1) {
        this.title = "Aggiorna Banca";
      } else if (this.action === 2) {
        this.title = "Inserisci Movimento";
      }

      //      }
    },
  },
};
</script>
