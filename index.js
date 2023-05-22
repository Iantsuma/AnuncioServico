//////////////////////////////////////////////////////////////////////////////////////
//Importa as bibliotecas que teremos que usar
const express = require('express')
const ejs = require("ejs")
var path = require('path')
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); //Diz para o express para utilizar a pasta public
app.set('view engine','ejs') //Diz para o express para utilizar ejs como a view engine padrão
//////////////////////////////////////////////////////////////////////////////////////
//Tudo relacionado ao banco de dados
const mongoose = require('mongoose')
const Usuario = require('./Models/Usuario')
const Perfil = require('./Models/Perfil')
const url = 'mongodb+srv://viniciuscyrino1:pqxTfWZmChQQK2Rs@cluster0.45jhp3m.mongodb.net/?retryWrites=true&w=majority'
const db = mongoose.connection
//////////////////////////////////////////////////////////////////////////////////////
var pessoa;
var juridico;
//////////////////////////////////////////////////////////////////////////////////////
//Abre o servidor local na porta 3000
app.listen(3000)
//////////////////////////////////////////////////////////////////////////////////////    
//Conecta com o banco de dados
async function connect(){
    try{
        await mongoose.connect(url)
        console.log("Connect to Mongo DB")
    }catch(error){
        console.error(error)
    }
}
connect();
//////////////////////////////////////////////////////////////////////////////////////
//HOME
app.get('/', (req, res) => {
    res.render('pages/home.ejs');
  })

  app.post('/', (req, res) => {

    if(req.body.hasOwnProperty("registraF")){
        return res.redirect("/registroF")
    }
    if(req.body.hasOwnProperty("registraJ")){
        return res.redirect("/registroJ")
    }
    if(req.body.hasOwnProperty("logar")){
        return res.redirect("/login")
    }   
    if(req.body.hasOwnProperty("busca")){
      return res.redirect("/busca")
  }
  if(req.body.hasOwnProperty("aval")){
    return res.redirect("/aval")
}
  })
//////////////////////////////////////////////////////////////////////////////////////
//REGISTRO
app.get('/registroF', (req, res) => {
    res.render('pages/registroF.ejs', {aviso: 0});
  })

app.get('/registroJ', (req, res) => {
    res.render('pages/registroJ.ejs', {aviso: 0});
  })

app.post('/registroF', async (req, res) => {
    var cpf = req.body.cpf
    var nome = req.body.name
    var email = req.body.email
    var endereco = req.body.endereco
    var senha = req.body.password
    var confirma_senha = req.body.confirmpassword

    if (nome == "" || email == ""  || endereco == "" || senha == "" || confirma_senha == "") {
       return res.render('pages/registroF.ejs', {aviso: "Por favor, preencha todos os campos!"});
      }

    if(!TestaCPF(cpf)){
      return res.render('pages/registroF.ejs', {aviso: "CPF Invalido"});    
    }

    //Confere se o email ja esta cadastrado 
    var usuario_existe = await Usuario.findOne({ email: req.body.email})

    if(usuario_existe){ 
        return res.render('pages/registroF.ejs', {aviso: "Email ja cadastrado"});     
    }

    //Confere se o cpf ja esta cadastrado 
     usuario_existe = await Usuario.findOne({ documento: req.body.cpf})

    if(usuario_existe){ 
        return res.render('pages/registroF.ejs', {aviso: "CPF ja cadastrado"});      
    }

    //Cria um novo usuario
    var novo_usuario = new Usuario({
        nome: nome,
        email: email,
        documento: cpf,
        senha: senha,
        endereco: endereco,       
      })
      //Tenta salvar no banco de dados
      try{          
        await novo_usuario.save()
      }catch(error){
        console.log(error)
      }
    
      res.redirect("/")
  })

  app.post('/registroJ', async (req, res) => {
    var cnpj = req.body.cnpj
    var nome = req.body.name
    var email = req.body.email
    var endereco = req.body.endereco
    var senha = req.body.password
    var confirma_senha = req.body.confirmpassword

    if (nome == "" || email == ""  || endereco == "" || senha == "" || confirma_senha == "") {
       return res.render('pages/registroJ.ejs', {aviso: "Por favor, preencha todos os campos!"});
      }

    /*
    if(cnpj.lenght != 12){
      return res.render('pages/registroF.ejs', {aviso: "CNPJ invalido"});
    }
    */
    //Confere se o email ja esta cadastrado 
    var usuario_existe = await Usuario.findOne({ email: req.body.email})

    if(usuario_existe){ 
        return res.render('pages/registroJ.ejs', {aviso: "Email ja cadastrado"});     
    }

    //Confere se o cpf ja esta cadastrado 
     usuario_existe = await Usuario.findOne({ documento: req.body.cnpj})

    if(usuario_existe){ 
        return res.render('pages/registroJ.ejs', {aviso: "CNPJ ja cadastrado"});      
    }

    //Cria um novo usuario
    var novo_usuario = new Usuario({
        nome: nome,
        email: email,
        documento: cnpj,
        senha: senha,
        endereco: endereco,       
      })
      //Tenta salvar no banco de dados
      try{          
        await novo_usuario.save()
      }catch(error){
        console.log(error)
      }
      res.redirect("/")
  })

//////////////////////////////////////////////////////////////////////////////////////
//LOGIN
app.get('/login', (req, res) => {
    res.render('pages/login.ejs', {aviso: 0});
  })

app.post('/login', async (req, res) => {
    var documento = req.body.documento
    var senha = req.body.password

    if (senha == "" || documento == "") {
       return res.render('pages/login.ejs', {aviso: "Por favor, preencha todos os campos!"});
      }

    var usuario_existe = await Usuario.findOne({documento: documento})

    if(usuario_existe){ 
        if(usuario_existe.senha == senha){
            pessoa = documento;
            return res.redirect('/profile')
        }else{
            return res.render('pages/login.ejs', {aviso: "Documento ou senha incorretos"});
        }
        
    }else{
        return res.render('pages/login.ejs', {aviso: "Documento ou senha incorretos"});
    }
     
  })

//////////////////////////////////////////////////////////////////////////////////////
//PROFILE
app.get('/profile', async (req, res) => {
 
  var usuario_existe = await Usuario.findOne({documento: pessoa})

  res.render('pages/profile.ejs', {nome: usuario_existe.nome,email: usuario_existe.email,
    endereco: usuario_existe.endereco,senha:usuario_existe.senha})
  })

app.post('/profile', async (req, res) => {

  if(req.body.hasOwnProperty("publico")){
    return res.redirect("/publico")
}

  if(req.body.hasOwnProperty("deletar")){
    await Usuario.findOneAndDelete({ documento: pessoa})
    return res.redirect("/")
  }

  if(req.body.hasOwnProperty("pagar")){
    return res.redirect("/cartao")
  }

  var documento = req.body.documento
  var nome = req.body.name
  var email = req.body.email
  var endereco = req.body.endereco
  var senha = req.body.password

  //Cria um novo usuario
  var novo_usuario = new Usuario({
    nome: nome,
    email: email,
    senha: senha,
    endereco: endereco,       
  })

  try{          
    Usuario.collection.replaceOne({ "documento":pessoa } , {"nome": nome,
     "email": email,
     "documento": pessoa,
     "senha": senha,
     "endereco": endereco
    })

}catch(error){
   console.log(error)
}
  
  res.redirect("/profile")
  })
//////////////////////////////////////////////////////////////////////////////////////
//PUBLICO
app.get('/publico', async (req, res) => {
 
  res.render('pages/publico.ejs')
  })

app.post('/publico', async (req, res) => {

  if (req.body.name == "" || req.body.contato == "" || req.body.valor_pagar == "" || req.body.servico == "") {
    return res.redirect('/publico');
   }
 
  //Cria um novo usuario
  var novo_perfil = new Perfil({
    documento: pessoa,
    endereco: req.body.endereco,
    contato: req.body.contato,
    valor: req.body.valor_pagar,
    descricao: req.body.descricao,
    tipo: req.body.servico,
    nome: req.body.name      
  })
  try{          
    await novo_perfil.save()
  }catch(error){
    console.log(error)
  }
  res.redirect("/")
  })
//////////////////////////////////////////////////////////////////////////////////////
app.get('/busca', async (req, res) => {
  res.render('pages/buscador.ejs')
  })

app.post('/busca', async (req, res) => {
  resultado = req.body.documento
  tipo = req.body.servico
  
  if(!tipo){
    var usuario_existe = await Perfil.find({nome : resultado})
  }else{
    var usuario_existe = await Perfil.find({nome : resultado, tipo : tipo })
  }

  juridico = usuario_existe
  res.redirect('/resposta')
    })
//////////////////////////////////////////////////////////////////////////////////////
//RESPOSTAS
app.get('/resposta', async (req, res) => {
 
  res.render('pages/busca.ejs',{results : juridico})
  })


  app.get('/cartao', async (req, res) => {
    res.render('pages/cartao.ejs',{aviso : 0})
    })

    app.post('/cartao', async (req, res) => {

      var numero_cartao = req.body.numero

     if(validarCartaoCredito(numero_cartao)){
        
        return res.render('pages/cartao.ejs',{aviso : 0})
     } 

     return res.render('pages/cartao.ejs',{aviso : "Cartão invalido"})
      })
    
    app.get('/aval', async (req, res) => {
        res.render('pages/avaliacao.ejs',{aviso : 0})
        })
    
        app.post('/aval', async (req, res) => {
    
          var avaliação = req.body.aval
          console.log(avaliação)
    
         if(avaliação < -1 || avaliação > 5){
            
            return res.render('pages/avaliacao.ejs',{aviso : "Por favor a avaliação deve ser entre 0 e 5"})
         } 
    
         res.redirect("/")
        })


  function TestaCPF(strCPF) {
    var Soma;
    var Resto;
    Soma = 0;
  if (strCPF == "00000000000") return false;

  for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
  Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;

  Soma = 0;
    for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
    return true;
}

function validarCartaoCredito(numeroCartao) {
  // Remover espaços em branco e caracteres não numéricos do número do cartão
  numeroCartao = numeroCartao.replace(/\s/g, '').replace(/\D/g, '');

  // Verificar se o número do cartão possui entre 13 e 19 dígitos
  if (numeroCartao.length < 13 || numeroCartao.length > 19) {
    return false;
  }

  // Aplicar o algoritmo de Luhn para verificar a validade do número do cartão
  let soma = 0;
  let multiplicador = 1;
  for (let i = numeroCartao.length - 1; i >= 0; i--) {
    let digito = parseInt(numeroCartao.charAt(i));
    digito *= multiplicador;
    if (digito > 9) {
      digito -= 9;
    }
    soma += digito;
    multiplicador = multiplicador === 1 ? 2 : 1;
  }

  return soma % 10 === 0;
}


const nodemailer = require('nodemailer');

// Configurações de transporte
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'aabbcc66dd@outlook.com',
    pass: 'senhaforte'
  }
});

// Configurações do email
const mailOptions = {
  from: 'aabbcc66dd@outlook.com',
  to: 'vinimazcy@gmail.com',
  subject: 'Nota fiscal',
  text: 'nota.pdf'
};

// Enviar email
transporter.sendMail(mailOptions, function(error, info) {
  if (error) {
    console.log(error);
  } else {
    console.log('Email enviado: ' + info.response);
  }
});

 

  