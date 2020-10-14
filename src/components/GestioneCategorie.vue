<template>
  <div class="app">
    <ModalConfiguration
      :model="modalCfg"
      :show="showModal"
      v-on:updateConfiguration="updateConfiguration"
    ></ModalConfiguration>
    <b-card no-body>
      <b-tabs card v-model="tabIndex" @input="getEsercenti">
        <b-tab no-body title="Esercenti Registrati" active></b-tab>
        <b-tab title="Esercenti Senza Categoria"></b-tab>
      </b-tabs>
      <b-card-text>
        <b-table
          class="ml-3 mt-3 mr-3"
          ref="merchants"
          selectable
          select-mode="single"
          :items="merchantsItems"
          :fields="merchantsFields"
          selected-variant="primary"
          @row-selected="onMerchantsRowSelected"
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
        <b-row class="justify-content-md-center mb-3">
          <b-button class="mx-2" variant="primary" :disabled="selectedMessage.length === 0" @click="associaCategoria"
            >Associa Categoria</b-button
          >
        </b-row></b-card-text
      >
    </b-card>
  </div>
</template>

<script>
import ModalConfiguration from "@/components/common/ModalConfiguration";
import getMyBankConfiguration from "@/services/MyBankConfiguration";
import HttpManager from "@/services/HttpManager";
import {
  GET_ESERCENTISENZACATEGORIE,
  GET_ESERCENTICATEGORIE,
  UPDATE_CATEGORY,
  getServiceInfo,
} from "@/services/restServices";
import { showMsgEsitoEsecuzione, showMsgErroreEsecuzione, showConfirmationMessage } from "@/services/utilities";

export default {
  name: "GestioneCategorie",
  components: { ModalConfiguration },
  data: function() {
    return {
      tabIndex: 0,
      selectedMessage: [],
      merchantsFields: [],
      merchantsItems: [],
      visibleMessage: false,
      isMerchantsBusy: false,
      categories: {},
      modalCfg: {
        title: "Configurazione Categorie Commerciali",
        fields: [],
      },
      fieldCategoria: {},
      showModal: false,
    };
  },
  mounted: function() {
    this.getMyBankConfiguration();
    this.getEsercenti();
  },
  methods: {
    updateCategory(request) {
      const httpService = new HttpManager();
      let info = getServiceInfo(UPDATE_CATEGORY);
      info.request = request;
      httpService
        .callNodeServer(info)
        .then((response) => {
          this.getEsercenti();
          showMsgEsitoEsecuzione(this, "Categoria aggiornata con successo!");
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error);
        });
    },
    updateConfiguration(updatedFields) {
      this.showModal = false;
      if (updatedFields != undefined && updatedFields.length === 1) {
        console.log("Update category");
        showConfirmationMessage(this, "Confermi l'aggiornamneto della categoria ?", this.updateCategory, {
          merchant: this.selectedMessage[0].merchant,
          category: updatedFields[0].value,
        });
      }
    },
    onMerchantsRowSelected(items) {
      this.selectedMessage = items;
    },
    async getMyBankConfiguration() {
      let cfg = await getMyBankConfiguration();
      this.categories = cfg.categories;
      let key = Object.keys(cfg.categories);
      let options = [];
      for (let ix = 0; ix < key.length; ix++)
        options.push({ text: cfg.categories[key[ix]].description, value: key[ix] });
      this.fieldCategoria = {
        label: "Categoria",
        type: "select",
        options: options,
      };
      this.modalCfg.fields = [this.fieldCategoria];
    },
    associaCategoria() {
      this.fieldCategoria.value = this.selectedMessage[0].key;
      this.fieldCategoria.label = "Categoria per " + this.selectedMessage[0].merchant;
      this.showModal = true;
    },
    getEsercenti() {
      console.log("Index : " + this.tabIndex);
      const httpService = new HttpManager();
      let info = getServiceInfo(this.tabIndex === 0 ? GET_ESERCENTICATEGORIE : GET_ESERCENTISENZACATEGORIE);
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
        }
      );
      this.isMerchantsBusy = true;
      httpService
        .callNodeServer(info)
        .then((response) => {
          var data = response.data;
          let esito = data.error;
          if (esito.code === 0) {
            let dati = data.data;
            var esercenti = [];

            for (var i = 0; i < dati.length; i++) {
              let d = dati[i];
              esercenti.push({
                key: d.category,
                merchant: d.merchant,
                category:
                  this.categories[d.category] === undefined ? d.category : this.categories[d.category].description,
              });
            }
            this.merchantsItems = esercenti;
          } else showMsgErroreEsecuzione(this);
          this.isMerchantsBusy = false;
        })
        .catch((error) => {
          showMsgErroreEsecuzione(this, error);
          this.isMerchantsBusy = true;
        });
    },
  },
};
</script>

<style></style>
