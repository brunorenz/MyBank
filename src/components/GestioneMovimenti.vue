<template>
  <div class="app">
    <b-card header="Filtro Ricerca">
      <b-row>
        <b-form-group label="Solo movimenti validi" class="col-sm-3">
          <b-form-checkbox
            id="msgAccepted"
            v-model="msgAccepted"
          ></b-form-checkbox>
        </b-form-group>
        <b-form-group
          label="Intervallo date"
          id="fieldDateRange"
          class="col-sm-3"
        >
          <div>
            <date-picker v-model="dateRange" type="month" range></date-picker>
          </div>
        </b-form-group>
      </b-row>
      <b-button
        variant="primary"
        @click="searchMovements"
        :disabled="dateRange === null"
        >Aggiorna</b-button
      >
    </b-card>
    <b-card header="Movimenti Registrati">
      <div v-if="itemsAllDare.length > 0">
        <div class="text-center"><h5>Movimenti in Dare</h5></div>

        <b-table
          ref="accountMovements"
          selectable
          select-mode="single"
          :items="itemsAllDare"
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
      </div>
      <div v-if="itemsAllAvere.length > 0">
        <div class="text-center"><h5>Movimenti in Avere</h5></div>
        <b-table
          ref="accountMovements"
          selectable
          select-mode="single"
          :items="itemsAllAvere"
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
          sticky-header="300px"
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
      </div>
      <b-card-text v-if="itemsAllAvere.length + itemsAllDare.length > 0">
        <b-row>
          <b-col class="col-sm-4">
            <div>Importo Totale Dare</div>
          </b-col>
          <b-col class="col-sm-3 text-right">
            <div>{{ this.totaleDare }}</div>
          </b-col>
        </b-row>
        <b-row>
          <b-col class="col-sm-4">
            <div>Importo Totale Avere</div>
          </b-col>
          <b-col class="col-sm-3 text-right">
            <div>{{ this.totaleAvere }}</div>
          </b-col>
        </b-row>
        <b-row>
          <b-col class="col-sm-4">
            <div><h5>Importo Totale dei movimenti selezionati</h5> </div>
          </b-col>
          <b-col class="col-sm-3 text-right">
            <div><h5>{{ this.totale }}</h5></div>
          </b-col>
        </b-row>
        <b-button
          variant="primary"
          @click="searchMovements"
          :disabled="selectedMessage.length === 0"
          >Dettaglio</b-button
        >
      </b-card-text>
    </b-card>
  </div>
</template>

<script>
import HttpManager from "@/services/HttpManager";
import {
  GET_CONFIGURATION,
  LIST_MOVEMENTS,
  getServiceInfo,
} from "@/services/restServices";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import "vue2-datepicker/locale/it";
import {
  showMsgEsitoEsecuzione,
  showMsgErroreEsecuzione,
  showConfirmationMessage,
} from "@/services/utilities";
import getMyBankConfiguration from "@/services/MyBankConfiguration";

export default {
  name: "GestioneMovimenti",
  components: { DatePicker },
  data: function () {
    return {
      selectedMessage: [],
      fieldsAll: [],
      itemsAllDare: [],
      itemsAllAvere: [],
      visibleMessage: false,
      dateRange: null,
      msgAccepted: true,
      totale: 0,
      totaleDare: 0,
      totaleAvere: 0,
      isAccountMovementsBusy: false,
      bankInfo: {},
      categories: {},
      movementType: {},
    };
  },
  mounted: function () {
    this.getMyBankConfiguration();
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
    async getMyBankConfiguration() {
      let cfg = await getMyBankConfiguration();
      this.categories = cfg.categories;
      this.bankInfo = cfg.accounts;
      this.movementType = cfg.movementType;
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
          key: "category",
          label: "Categoria",
          sortable: true,
        },
        {
          key: "type",
          label: "Natura",
          sortable: true,
        }
      );
      let totale = 0;
      let totaleD = 0;
      let totaleA = 0;
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
            var datiServersD = [];
            var datiServersA = [];
            for (var i = 0; i < dati.length; i++) {
              let d = dati[i];
              let dType = "N/D";
              let mvInfo = this.movementType[d.tipoMovimento];
              if (mvInfo != undefined) {
                dType = mvInfo.description;
              }

              let entry = {
                date: typeof d.data === "undefined" ? d.messageDate : d.data,
                importo: d.importo,
                esercente: d.esercente,
                type: dType,
                _id: d._id,
                msgId: d.msgId,
                messageTime: d.messageTime,
                bankId: d.bankId,
                category: "N/D",
              };
              if (this.bankInfo[d.bankId] != undefined)
                entry.bankId = this.bankInfo[d.bankId].bankName;
              if (this.categories[d.categoria] != undefined)
                entry.category = this.categories[d.categoria].description;
              if (
                d.segnoMovimento != undefined &&
                d.segnoMovimento === "AVERE"
              ) {
                if (typeof d.importo === "number") totaleA += d.importo;
                datiServersA.push(entry);
              } else {
                if (typeof d.importo === "number") totaleD += d.importo;
                datiServersD.push(entry);
              }
            }
            this.itemsAllDare = datiServersD;
            this.itemsAllAvere = datiServersA;
          } else showMsgErroreEsecuzione(this);
          this.isAccountMovementsBusy = false;
          this.totale = this.formatImporto(totaleD - totaleA);
          this.totaleDare = this.formatImporto(totaleD);
          this.totaleAvere = this.formatImporto(totaleA);
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error);
          this.isAccountMovementsBusy = true;
          this.totale = this.formatImporto(totale);
        });
    },
  },
};
</script>

<style></style>
