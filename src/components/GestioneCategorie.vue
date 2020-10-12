<template>
  <div class="app">
    <b-card no-body>
      <b-tabs>
        <b-tab title="Esercenti Registrati" active>
          <b-card-text>
            <b-table
              ref="merchants"
              selectable
              select-mode="single"
              :items="merchantsItems"
              :fields="merchantsFields"
              selected-variant="primary"
              @row-selected="onMerchantsRowSelected"
              @row-contextmenu="rightClicked"
              responsive="md"
              sort-icon-left
              striped
              small
              bordered
              head-variant="light"
              sticky-header="400px"
              :busy="isMerchantsBusy"
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
                  <b-row class="justify-content-md-center">
        <b-button class="mx-2" variant="primary" @click="deleteMessageMsgBox"
          >Elimina filtro</b-button
        >
        <b-button class="mx-2" variant="primary" v-b-toggle.collapse-1-inner
          >Aggiungi filtro</b-button
        >
      </b-row></b-card-text
          >
        </b-tab>
        <b-tab title="Esercenti Senza Categoria">
          <b-card-text>Tab contents 2</b-card-text>
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import HttpManager from "@/services/HttpManager";
import {
  GET_CONFIGURATION,
  GET_ESERCENTI,
  GET_ESERCENTICATEGORIE,
  getServiceInfo,
} from "@/services/restServices";
import {
  showMsgEsitoEsecuzione,
  showMsgErroreEsecuzione,
  showConfirmationMessage,
} from "@/services/utilities";

export default {
  name: "GestioneCategorie",
  components: {},
  data: function () {
    return {
      selectedMessage: [],
      merchantsFields: [],
      merchantsItems: [],
      visibleMessage: false,
      isMerchantsBusy: false,
    };
  },
  mounted: function () {
    this.getMyBankConfiguration();
    this.getEsercenti();
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

    rightClicked(item, index, evt) {
      // Prevent native OS/Browser context menu showing
      evt.preventDefault();
      // Log the event
      console.log("right clicked row " + index, evt.type);
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
            let ac = {};
            for (let ix = 0; ix < d.accounts.length; ix++) {
              ac[d.accounts[ix].bankKey] = d.accounts[ix];
            }
            this.bankInfo = ac;
          }
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error);
        });
    },
    getEsercenti() {
      const httpService = new HttpManager();
      let info = getServiceInfo(GET_ESERCENTICATEGORIE);
      this.merchantsFields.push(
        {
          key: "merchant",
          label: "Esercente",
          sortable: true,

        },
        {
          key: "category",
          label: "Categoria",
          sortable: true,
        },

      );
      httpService
        .callNodeServer(info)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          if (esito.code === 0) {
            let dati = data.data;
            var esercenti = dati;

            for (var i = 0; i < dati.length; i++) {
              let d = dati[i];
            }
            this.merchantsItems = esercenti;
          } else showMsgErroreEsecuzione(this);
          this.isMeAccountMovementsBusy = false;
          this.totale = this.formatImporto(totale);
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error);
          this.isAccountMovementsBusy = true;
          this.totale = this.formatImporto(totale);
        });
    },
    searchMovements() {
      this.isAccountMovementsBusy = true;
      this.fieldsAll.push({
        key: "category",
        label: "Chiave",
        sortable: true,
        stickyColumn: true,
        variant: "primary",
      });
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
              if (typeof d.bancomat != "undefined" && d.bancomat)
                dType = "Bancomat";
              else if (typeof d.cartacredito != "undefined" && d.cartacredito)
                dType = "Carta di Credito";
              else if (
                typeof d.accreditoconto != "undefined" &&
                d.accreditoconto
              )
                dType = "Accredito C/C";
              else if (typeof d.addebitoconto != "undefined" && d.addebitoconto)
                dType = "Addebito C/C";
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
              if (this.bankInfo[d.bankId] != undefined)
                entry.bankId = this.bankInfo[d.bankId].bankName;
              if (typeof d.importo === "number") totale += d.importo;
              datiServers.push(entry);
            }
            this.itemsAll = datiServers;
          } else showMsgErroreEsecuzione(this);
          this.isAccountMovementsBusy = false;
          this.totale = this.formatImporto(totale);
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
