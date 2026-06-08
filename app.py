from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify

from services.financeiro import Financeiro
from models.transacao import Transacao

app = Flask(__name__)

financeiro = Financeiro()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/transacoes", methods=["GET"])
def listar():

    return jsonify(
        financeiro.carregar()
    )


@app.route("/api/transacoes", methods=["POST"])
def adicionar():

    dados = request.get_json()

    transacao = Transacao(
        dados["tipo"],
        dados["descricao"],
        dados["valor"],
        dados["categoria"]
    )

    financeiro.adicionar(
        transacao.to_dict()
    )

    return jsonify({
        "mensagem": "Transação cadastrada"
    })


@app.route("/api/saldo")
def saldo():

    return jsonify({
        "saldo": financeiro.saldo()
    })


if __name__ == "__main__":
    app.run(debug=True)


@app.route("/api/transacoes/<int:id>", methods=["DELETE"])
def excluir(id):

    dados = financeiro.carregar()

    if id < len(dados):
        dados.pop(id)

    financeiro.salvar(dados)

    return jsonify({
        "mensagem":"Removido"
    })