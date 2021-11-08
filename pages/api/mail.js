const axios = require('axios')
const Mailgun = require('mailgun-js')

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  if (req.method === 'OPTIONS') {
    res.status(200).send('ok').end()
    return
  }
  return await fn(req, res)
}

const sendEmail = async (req, res) => {
  const api_key = process.env.MAILGUN_SENDING_KEY
  const telegram_chat_id = process.env.TELEGRAM_CHAT_ID
  const domain = 'mg.thepipeline.xyz'
  const client_id = req.body.client_id
  var mailgun = new Mailgun({apiKey: api_key, domain: domain});
  const telegram_api = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`

  const clients = [
    {
      id: process.env.CLIENT_ID_TOMAS,
      name: 'tomas',
      email: process.env.CLIENT_EMAIL_TOMAS
    },
    {
      id: process.env.CLIENT_ID_QUALIS,
      name: 'qualis',
      email: process.env.CLIENT_EMAIL_QUALIS
    }
  ]

  const getClientEmail = (id) => {
    const client = clients.filter(each => {
      return each.id == id
    })[0]
    return client.email
  }

  const mailOptions = {
    to: getClientEmail(client_id),
    from: 'thepipeline@contento.ar',
    subject: 'Contacto desde la web',
    text: 'Contacto',
    html: `
    <h1>Nuevo contacto desde la web</h1>
    <p>Datos de contacto: </p>
    Nombre: ${req.body.name}<br>
    Email: ${req.body.email}<br>
    Phone: ${req.body.phone}<br>
    Mensaje: ${req.body.message}<br>
    <br>
    <hr>
    <p>Sended with love from
      <span>
        <a href="thepipeline.xyz"style="color: inherit; text-decoration: none;">
        <strong>the pipeline.</strong>
        </a>
      <span>
    </p>
    `,
  }

  const sendTelegram = async() => {
    await axios.post(`${telegram_api}/sendMessage`, {
      chat_id: telegram_chat_id,
      text: `thepipeline\nto: ${getClientEmail(client_id)}`
    })
  }

  await sendTelegram()  

  await mailgun.messages().send(mailOptions, function (err, body) {
    if (err) {
      console.log('err sending mail');
      console.log(err);
      res.status(500).send({status: 'failed'})
      return reject(error);
    } else {
      console.log('email success', body);
    }

    return
  });

  console.log("SENT 🪠🚀")
  return res.status(200).send({status: 'success'})
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const sleepAPI = async () => {
  const sleepTimer = 5000;
  console.log(`sleeping for ${sleepTimer}ms`);
  await sleep(sleepTimer);
  console.log(`I am awake.`);
  return res.status(200).send({status: 'awake', sleptFor: sleepTimer});
}

module.exports = allowCors(sleepAPI)
