const express = require("express");
const app = express();
const port = 4000;
const cors = require("cors");
app.use(cors());
const dal = require("./dal");

app.get("/account/create/:name/:mail/:password/:balance", (req, res) => {
  const { name, mail, password, balance } = req.params;
  let user = {
    name,
    mail,
    password,
    balance:Number(balance)
  };
  dal.findByMail(user.mail).then((users) => {
    console.log(`existentUser=${JSON.stringify(users)}`);
    console.log(users?.length);
    if (users?.length == 0) {
      dal.create(user);
      res.send(JSON.stringify(user));
    }else{
        res.status(515).send("Usuario duplicado, por favor ingrese un nuevo usuario");
    }
  });
  
});

app.get("/login/:mail/:password",(req,res)=>{
  const { mail, password } = req.params;
  dal.findByMail(mail).then((users)=>{
    if(users.length > 0){
      let user = users[0];
      if(password == user.password){
        res.send(user);
      }else{
        res.status(516).send("Error de usuario o contraseña, por favor intente nuevamente");  
      }
    }else{
      res.status(516).send("Error de usuario o contraseña, por favor intente nuevamente");
    }
  })
});

app.get("/operaciones/deposito/:mail/:monto",(req, res) => {
  const { mail, monto } = req.params;
  dal.deposito(mail,monto).then((user)=> {
    res.send(user);
  }).catch(err=>{
    console.log(err);
    res.status(517).send("Ooops ha ocurrido un error durante el deposito")
  });
});

app.get("/operaciones/retiro/:mail/:monto",(req, res) => {
  const { mail, monto } = req.params;
  dal.retiro(mail,monto).then((user)=> {
    res.send(user);
  }).catch(err=>{
    console.log(err);
    res.status(517).send("Ooops ha ocurrido un error durante el retiro");
  });
});

app.get("/operaciones/:idUsuario", (req,res)=>{
  const {idUsuario} = req.params;
  dal.findOperaciones(idUsuario).then((operaciones)=>{
    res.send(operaciones);
  }).catch(()=>{
    console.log(err);
    res.status(518).send("No fue posible obtener las operaciones");
  });
})

app.listen(port);
console.log("app running on port ", port);
