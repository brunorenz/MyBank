<template>
  <div class="app">
    <b-card header="Filtro Ricerca">
      <b-row>
        <b-form-group label="Mostra messaggi non accettati" class="col-sm-3">
          <b-form-checkbox id="showMsgNotAccepted" v-model="showMsgNotAccepted" @input="filterChange"></b-form-checkbox>
        </b-form-group>
        <b-form-group label="Intervallo date" id="fieldDateRange" class="col-sm-4">
          <div>
            <date-picker v-model="dateRange" type="month" range @input="filterChange"></date-picker>
          </div>
        </b-form-group>
      </b-row>
      <b-button variant="primary" @click="addMovementDetail" :disabled="showMsgNotAccepted"
        >Aggiungi Movimento</b-button
      >
      <b-button class="ml-2" variant="primary" @click="searchMovements" :disabled="dateRange === null"
        >Aggiorna</b-button
      >
    </b-card>
    <b-card :header="movementTitle">
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
            <div><h5>Importo Totale dei movimenti selezionati</h5></div>
          </b-col>
          <b-col class="col-sm-3 text-right">
            <div>
              <h5>{{ this.totale }}</h5>
            </div>
          </b-col>
        </b-row>

        <b-button variant="primary" @click="readMovementDetail(false)" :disabled="selectedMessage.length === 0"
          >Dettaglio Movimento</b-button
        >
        <b-button class="ml-2" variant="primary" @click="readMessageDetail" :disabled="selectedMessage.length === 0"
          >Dettaglio Messaggio</b-button
        >
        <b-button
          class="ml-2"
          variant="primary"
          @click="readMovementDetail(true)"
          :disabled="selectedMessage.length != 1 || selectedMessage[0].updateBankId === false"
          >Aggiorna Conto</b-button
        >
      </b-card-text>
    </b-card>
    <ModalMessage :msgDet="msgDet" :show="showModalMessageDetail" v-on:updateMessage="updateMessage"></ModalMessage>
    <ModalMovement
      :msgDet="movement"
      :show="showModalMovementDetail"
      :action="movementAction"
      :configuration="config"
      v-on:updateMessage="updateMovement"
    ></ModalMovement>
  </div>
</template>

<script>
import HttpManager from "@/services/HttpManager";
import { READ_MESSAGE, LIST_MOVEMENTS, getServiceInfo } from "@/services/restServices";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import "vue2-datepicker/locale/it";
import { showMsgEsitoEsecuzione, showMsgErroreEsecuzione, showConfirmationMessage } from "@/services/utilities";
import getMyBankConfiguration from "@/services/MyBankConfiguration";
import ModalMessage from "@/components/common/ModalMessage";
import ModalMovement from "@/components/common/ModalMovement";

export default {
  name: "GestioneMovimenti",
  components: { DatePicker, ModalMessage, ModalMovement },
  data: function() {
    return {
      selectedMessage: [],
      fieldsAll: [],
      itemsAllDare: [],
      itemsAllAvere: [],
      visibleMessage: false,
      dateRange: null,
      showMsgNotAccepted: false,
      movementTitle: "",
      totale: 0,
      totaleDare: 0,
      totaleAvere: 0,
      isAccountMovementsBusy: false,
      config: {
        bankInfo: {},
        categories: {},
        movementType: {},
      },
      showModalMessageDetail: false,
      showModalMovementDetail: false,
      movementAction: 0,
      movement: {},
      msgDet: {},
    };
  },
  mounted: function() {
    this.getMyBankConfiguration();
    let now1 = new Date();
    let now2 = new Date();
    now1.setDate(1);
    now1.setDate(1);
    this.dateRange = [now1, now2];
    this.searchMovements();
  },
  methods: {
    filterChange() {
      this.searchMovements();
    },
    getDateFromStringIt(inDate) {
      var pattern = /(\d{2})\/(\d{2})\/(\d{4})/;
      let a = inDate.replace(pattern, "$3-$2-$1");
      return new Date(a);
    },

    // checkRange() {
    //   return this.dateRange === null;
    // },
    // getRow(row) {
    //   console.log("ROW = " + row);
    //   return row;
    // },
    onRowSelected(items) {
      this.selectedMessage = items;
    },
    // selectAllMessages() {
    //   this.$refs.accountMovements.selectAllRows();
    // },
    // deselectAllMessages() {
    //   this.$refs.accountMovements.clearSelected();
    // },
    updateMessage(message) {
      this.showModalMessageDetail = false;
    },
    updateMovement(movement) {
      this.showModalMovementDetail = false;
    },
    sortCompareDate(aRow, bRow, key) {
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
      this.config = {
        categories: cfg.categories,
        bankInfo: cfg.accounts,
        movementType: cfg.movementType,
      };
    },
    readMovementDetail(update) {
      this.movementAction = update ? 1 : 0;
      this.movement = this.selectedMessage[0].fullMovement;
      this.showModalMovementDetail = true;
    },
    addMovementDetail(update) {
      this.movementAction = 2;
      this.movement = {
        accepted: true,
        type: "MANUAL",
        messageDate: "28/10/2020",
        messageTime: 1603839600000,
        importo: 0,
      };
      this.showModalMovementDetail = true;
    },
    readMessageDetail() {
      const httpService = new HttpManager();
      let info = getServiceInfo(READ_MESSAGE);
      info.query.msgId = this.selectedMessage[0].fullMovement.msgId;
      httpService
        .callNodeServer(info)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          let dati = data.data;
          if (esito.code === 0) {
            this.msgDet = dati;
            this.showModalMessageDetail = true;
          } else showMsgErroreEsecuzione(this);
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error);
        });
    },
    searchMovements() {
      this.isAccountMovementsBusy = true;
      let input = {
        dateTo: this.$moment(this.dateRange[1]).format("DD/MM/YYYY"),
        dateFrom: this.$moment(this.dateRange[0]).format("DD/MM/YYYY"),
        accepted: !this.showMsgNotAccepted,
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
          key: "account",
          label: "Conto",
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
      this.movementTitle = "Movimenti Registrati";
      if (!input.accepted) this.movementTitle += " non accettati";
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
              let mvInfo = this.config.movementType[d.tipoMovimento];
              if (mvInfo != undefined) {
                dType = mvInfo.description;
              }
              let entry = {
                importo: d.importo,
                esercente: d.esercente,
                type: dType,
                bankId: d.bankId,
                category: "N/D",
                fullMovement: d,
                account: "",
              };
              if (d.data === undefined) {
                entry.date = d.messageDate;
                entry.messageTime = d.messageTime;
              } else {
                entry.date = d.data;
                // data in formato DD/MM/YYYY
                //var pattern = /(\d{2})\/(\d{2})\/(\d{4})/;
                //let a = d.data.replace(pattern, "$3-$2-$1");
                entry.messageTime = this.getDateFromStringIt(d.data);
              }
              entry.updateBankId = false;
              if (this.config.bankInfo[d.bankId] != undefined) {
                entry.bankId = this.config.bankInfo[d.bankId].bankName;
                entry.account = this.config.bankInfo[d.bankId].description;
                entry.updateBankId = this.config.bankInfo[d.bankId].accountByMessage;
              }
              if (this.config.categories[d.categoria] != undefined)
                entry.category = this.config.categories[d.categoria].description;
              if (d.segnoMovimento != undefined && d.segnoMovimento === "AVERE") {
                if (typeof d.importo === "number") totaleA += d.importo;
                datiServersA.push(entry);
              } else {
                if (typeof d.importo === "number") totaleD += d.importo;
                datiServersD.push(entry);
              }
            }
            datiServersD.sort((uno, due) => {
              return due.messageTime - uno.messageTime;
            });
            datiServersA.sort((uno, due) => {
              return due.messageTime - uno.messageTime;
            });
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
