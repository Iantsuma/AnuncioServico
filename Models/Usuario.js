const mongoose = require('mongoose')

const Usuario = mongoose.model('Usuario', {
    id: String,
    nome: String,
    email: String,
    documento: String,
    senha: String,
    endereco: String
})

module.exports = Usuario