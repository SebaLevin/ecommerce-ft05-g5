// ==================IMPORTS================================
const {apiKey, domain} = process.env;
const mailgun = require('mailgun-js')({ apiKey, domain });

function mailCreator (to, subject, text){

    const mailOptions = {
        from: "henrymov.g05@gmail.com",
        to,
        subject,
        text,
        html:"<html><body><h2>Un email </h2><p>un texto de email</p><button>Verificar</button></body></html>"
    };

    mailgun.messages().send(mailOptions, function (error, body) {
        console.log(body);
      });
}

module.exports = mailCreator;
