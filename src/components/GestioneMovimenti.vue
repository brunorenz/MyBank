<template>
  <div class="app">
    <b-card header="Filtro Ricerca">
      <b-row>
        <b-form-group label="Solo movimenti validi" class="col-sm-3">
          <b-form-checkbox id="msgAccepted" v-model="msgAccepted"></b-form-checkbox>
        </b-form-group>
        <b-form-group label="Intervallo date" id="fieldDateRange" class="col-sm-3">
          <div>
            <date-picker v-model="dateRange" type="month" range></date-picker>
          </div>
        </b-form-group>
      </b-row>
      <b-button variant="primary" @click="searchMovements" :disabled="dateRange === null">Aggiorna</b-button>
    </b-card>
    <b-card header="Movimenti Registrati">
      <b-table
        ref="accountMovements"
        selectable
        select-mode="single"
        :items="itemsAll"
        :fields="fieldsAll"
        selected-variant="primary"
        @row-selected="onRowSelected"
        @row-contextmenu="rightClicked"
        responsive="md"
        sort-icon-left
        striped
        small
        bordered
        head-variant="light"
        sticky-header="400px"
        :sort-compare="sortCompareDate"
        :busy="isAccountMovementsBusy"
      >
        <template v-slot:table-busy>
          <div class="text-center text-danger my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
        </template>
        <template v-slot:cell(importo)="data">
          <div class="text-right">{{ data.value }}</div>
        </template>
        <template v-slot:cell(date)="data">
          <div class="text-center">{{ data.value }}</div>
        </template>
      </b-table>
      <b-card-text v-if="itemsAll.length > 0">
        <h5>Importo Totale dei movimenti selezionati {{ this.totale }}</h5>
        <b-button variant="primary" @click="searchMovements" :disabled="selectedMessage.length === 0"
          >Dettaglio</b-button
        >
      </b-card-text>
    </b-card>
  </div>
</template>

<script>
import HttpManager from "@/services/HttpManager";
import { LIST_MOVEMENTS, getServiceInfo } from "@/services/restServices";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import "vue2-datepicker/locale/it";
import { showMsgEsitoEsecuzione, showMsgErroreEsecuzione, showConfirmationMessage } from "@/services/utilities";

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
      totale: 0,
      isAccountMovementsBusy: false,
    };
  },
  mounted: function() {
    let now1 = new Date();
    let now2 = new Date();
    now1.setDate(1);
    now1.setDate(1);
    this.dateRange = [now1, now2];
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
    formatImporto(value) {
      var formatter = new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
      });
      return formatter.format(value);
    },
    searchMovements() {
      this.isAccountMovementsBusy = true;
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
          stickyColumn: true,
          variant: "primary",
        },
        {
          key: "bankId",
          label: "Banca",
          sortable: true,
        },
        {
          key: "importo",
          label: "Importo",
          formatter: (value) => {
            return this.formatImporto(value);
          },
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
      let totale = 0;
      const httpService = new HttpManager();
      let info = getServiceInfo(LIST_MOVEMENTS);
      info.request = input;
      httpService
        .callNodeServer(info)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          if (esito.code === 0) {
            let dati = data.data;
            var datiServers = [];

            for (var i = 0; i < dati.length; i++) {
              let d = dati[i];
              //TODO leggere da configurazione
              let dType = "Pos";
              if (typeof d.bancomat != "undefined" && d.bancomat) dType = "Bancomat";
              else if (typeof d.cartacredito != "undefined" && d.cartacredito) dType = "Carta di Credito";
              else if (typeof d.accreditoconto != "undefined" && d.accreditoconto) dType = "Accredito C/C";
              else if (typeof d.addebitoconto != "undefined" && d.addebitoconto) dType = "Addebito C/C";
              let entry = {
                date: typeof d.data === "undefined" ? d.messageDate : d.data,
                importo: d.importo,
                esercente: d.esercente,
                type: dType,
                _id: d._id,
                msgId: d.msgId,
                messageTime: d.messageTime,
                bankId: d.bankId,
              };
              if (typeof d.importo === "number") totale += d.importo;
              datiServers.push(entry);
            }
            this.itemsAll = datiServers;
          } else showMsgErroreEsecuzione(this);
          this.isAccountMovementsBusy = false;
          this.totale = this.formatImporto(totale);
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this);
          this.isAccountMovementsBusy = true;
          this.totale = this.formatImporto(totale);
        });
    },
  },
};
</script>

<style></style>
