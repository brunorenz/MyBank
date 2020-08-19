let showMsgEsitoEsecuzione = function(obj, message) {
  let options = {
    title: "Esito Esecuzione Servizio",
    okVariant: "success",
    footerClass: "p-2 border-top-0",
    centered: true,
  };
  obj.$bvModal
    .msgBoxOk(message, options)
    .then((value) => {})
    .catch((err) => {
      console.error("Errore in display msgbox : " + err);
    });
};

exports.showMsgEsitoEsecuzione = showMsgEsitoEsecuzione;

let showMsgErroreEsecuzione = function(obj, esito, funzione) {
  let msg = esito;
  if (typeof esito != "undefined" && typeof esito.code != "undefined") {
    msg = "Return code : " + esito.code + " , Message : " + esito.message;
  }
  if (typeof funzione != "undefined")
    msg = "Servizio " + funzione + " : " + msg;
  console.log(msg);
  let options = {
    title: "Errore Esecuzione Servizio",
    okVariant: "danger",
    footerClass: "p-2 border-top-0",
    centered: true,
  };
  obj.$bvModal
    .msgBoxOk(msg, options)
    .then((value) => {})
    .catch((err) => {
      console.error("Errore in display msgbox : " + err);
    });
};

exports.showMsgErroreEsecuzione = showMsgErroreEsecuzione;

let showConfirmationMessage = function(obj, message, operation) {
  let options = {
    title: "Conferma Operazione",
    okVariant: "success",
    cancelVariant: "danger",
    footerClass: "p-2 border-top-0",
    centered: true,
  };
  obj.$bvModal
    .msgBoxConfirm(message, options)
    .then((value) => {
      if (value) operation();
    })
    .catch((err) => {
      console.error("Errore in display msgbox : " + err);
    });
};

exports.showConfirmationMessage = showConfirmationMessage;
