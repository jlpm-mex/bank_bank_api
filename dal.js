const moment = require("moment/moment");
const keys = require("./keys");

const MongoClient = require("mongodb").MongoClient;
const url =
  `mongodb+srv://${keys.mongodbuser}:${keys.mongodbpwd}@mitmern.sjy5t2a.mongodb.net/?retryWrites=true&w=majority`;

let db = null;

const TIPO_DE_OPREACION = {
  deposito: "DEPOSITO",
  retiro: "RETIRO",
};

// connect to mongo
MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
  console.log("Connected successfully to db server");

  // connect to myproject database
  db = client.db("test");
});

const create = (user) => {
  console.log(`user=${JSON.stringify(user)}`);
  return new Promise((resolve, reject) => {
    const collection = db.collection("users");
    const doc = user;
    collection.insertOne(doc, { w: 1 }, function (err, result) {
      err ? reject(err) : resolve(doc);
    });
  });
};

const findByMail = (mail) => {
  console.log(`mail=${mail}`);
  return new Promise((resolve, reject) => {
    const collection = db.collection("users");

    collection.find({ mail: mail }).toArray(function (err, result) {
      console.log(result);
      err ? reject(err) : resolve(result);
    });
  });
};

const deposito = (mail, monto) => {
  console.log(`mail=${mail}, monto=${monto}`);

  return new Promise((resolve, reject) => {
    findByMail(mail).then((users) => {
      let user = users[0];
      if (user != undefined || user != null) {
        console.log(`lastBalance = ${user.balance}`);
        user.balance = Number(user.balance) + Number(monto);
        console.log(`newBalance = ${user.balance}`);
        registroOperacion(
          user._id,
          user.mail,
          monto,
          TIPO_DE_OPREACION.deposito
        );
        const collection = db.collection("users");
        collection.updateOne(
          { _id: user._id },
          { $set: { balance: user.balance } }
        );
        resolve(user);
      } else {
        reject("usuario no encontrado");
      }
    });
  });
};

const retiro = (mail, monto) => {
  console.log(`mail=${mail}, monto a retirar=${monto}`);

  return new Promise((resolve, reject) => {
    findByMail(mail).then((users) => {
      let user = users[0];
      if (user != undefined || user != null) {
        console.log(`lastBalance = ${user.balance}`);
        user.balance = Number(user.balance) - Number(monto);
        console.log(`newBalance = ${user.balance}`);
        registroOperacion(user._id, user.mail, monto, TIPO_DE_OPREACION.retiro);
        const collection = db.collection("users");
        collection.updateOne(
          { _id: user._id },
          { $set: { balance: user.balance } }
        );
        resolve(user);
      } else {
        reject("usuario no encontrado");
      }
    });
  });
};

const registroOperacion = (idUsuario, mail, monto, type) => {
  return new Promise((resolve, reject) => {
    const collection = db.collection("operaciones");
    let operacion = {
      idUsuario,
      mail,
      monto,
      type,
      fecha: moment().format("Y-MM-DD HH:mm:ss"),
    };
    collection.insertOne(operacion, { w: 1 }, function (err, result) {
      err ? reject(err) : resolve(operacion);
    });
  });
};

const findOperaciones = (idUsuario) => {
  return new Promise((resolve, reject) => {
    const collection = db.collection("operaciones");
    collection.find(`{idUsuario:${idUsuario}}`).toArray(function (err, result) {
      console.log(result);
      err ? reject(err) : resolve(result);
    });
  });
};

module.exports = { create, findByMail, deposito, retiro, findOperaciones };
