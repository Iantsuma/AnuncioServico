const mongoose = require('mongoose')

const Perfil = mongoose.model('Perfil', {
    documento: String,
    endereco: String,
    contato: String,
    valor: String,
    descricao: String,
    tipo: String,
    nome: String
})

module.exports = Perfil