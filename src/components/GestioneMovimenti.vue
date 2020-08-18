<template>
  <div class="app">
    <b-card title="Filtro Ricerca">
      <b-row>
        <b-form-group label="Solo movimenti validi" class="ml-3">
          <b-form-checkbox
            id="msgAccepted"
            v-model="msgAccepted"
          ></b-form-checkbox>
        </b-form-group>
        <b-form-group label="Intervallo date" id="fieldDateRange" class="ml-5">
          <date-picker v-model="dateRange" type="month" range></date-picker>
        </b-form-group>
      </b-row>
      <b-button
        class="mx-2"
        variant="primary"
        @click="searchMovements"
        :disabled="dateRange === null"
        >Aggiorna</b-button
      >
    </b-card>
    <b-card title="Movimenti Registrati">
      <b-table
        ref="accountMovements"
        selectable
        select-mode="single"
        :items="itemsAll"
        :fields="fieldsAll"
        selected-variant="primary"
        @row-selected="onRowSelected"
        @row-contextmenu="rightClicked"
        responsive="sm"
        sort-icon-left
        head-variant="light"
        striped
        small
        bordered
        sticky-header
        :sort-compare="sortCompareDate"
      >
      </b-table>
      <!--
      <b-row class="justify-content-md-center">
        <b-button
          class="mx-2"
          variant="primary"
          v-b-toggle.collapse-2-inner
          :disabled="selectedAll.length === 0"
          >Mostra messaggi</b-button
        >
      </b-row>
      -->
    </b-card>
  </div>
</template>

<script>
import HttpMonitor from "@/services/httpMonitorRest";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import "vue2-datepicker/locale/it";

export default {
  name: "GestioneMovimenti",
  components: { DatePicker },
  data: function() {
    return {
      selectedMessage: [],
      fieldsAll: [],
      itemsAll: [],
      visibleMessage: false,
      dateRange: null,
      msgAccepted: true,
    };
  },
  mounted: function() {
    let now1 = new Date();
    let now2 = new Date();
    now1.setDate(1);
    now1.setDate(1);
    this.dateRange = [now1, now2];
  },
  beforeUpdate: function() {
    console.log("BEFORE UPDATED");
  },
  methods: {
    checkRange() {
      return this.dateRange === null;
    },
    getRow(row) {
      console.log("ROW = " + row);
      return row;
    },
    onRowSelected(items) {
      this.selectedMessage = items;
    },
    selectAllMessages() {
      this.$refs.accountMovements.selectAllRows();
    },
    deselectAllMessages() {
      this.$refs.accountMovements.clearSelected();
    },
    showConfirmationMessage(message, operation) {
      this.$bvModal
        .msgBoxConfirm(message)
        .then((value) => {
          if (value) operation();
        })
        .catch((err) => {
          console.error("Errore in msgbox conferma operazione : " + err);
        });
    },
    sortCompareDate(aRow, bRow, key) {
      //console.log("Sort Compare for key " + key + " DESC " + sortDesc);
      if (key === "date") {
        return aRow.messageTime - bRow.messageTime;
      }
      return false;
    },
    rightClicked(item, index, evt) {
      // Prevent native OS/Browser context menu showing
      evt.preventDefault();
      // Log the event
      console.log("right clicked row " + index, evt.type);
    },
    searchMovements() {
      const httpService = new HttpMonitor();
      let input = {
        dateTo: this.$moment(this.dateRange[1]).format("DD/MM/YYYY"),
        dateFrom: this.$moment(this.dateRange[0]).format("DD/MM/YYYY"),
        accepted: this.msgAccepted,
      };
      this.fieldsAll.push(
        {
          key: "date",
          label: "Data",
          sortable: true,
        },
        {
          key: "importo",
          label: "Importo",
        },
        {
          key: "esercente",
          label: "Esercente",
          sortable: true,
        },
        {
          key: "type",
          label: "Natura",
          sortable: true,
        }
      );
      httpService
        .listAccountMovements(input)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          if (esito.code === 0) {
            let dati = data.data;
            var datiServers = [];
            for (var i = 0; i < dati.length; i++) {
              let d = dati[i];
              let dType = "Pos";
              if (typeof d.bancomat != "undefined" && d.bancomat)
                dType = "Bancomat";
              else if (typeof d.cartacredito != "undefined" && d.cartacredito)
                dType = "Carta di Credito";
              let entry = {
                date: typeof d.data === "undefined" ? d.messageDate : d.data,
                importo: d.importo,
                esercente: d.esercente,
                type: dType,
                _id: d._id,
                msgId: d.msgId,
                messageTime: d.messageTime,
              };

              datiServers.push(entry);
            }
            this.itemsAll = datiServers;
          } else
            console.log(
              "Error callig service 'listMessages' : " + esito.message
            );
        })
        .catch((error) => {
          console.log("Error callig service 'listMessages' : " + error);
        });
    },
  },
};
</script>

<style></style>
