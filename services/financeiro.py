import json
import os

ARQUIVO = "dados.json"


class Financeiro:

    def carregar(self):
        if not os.path.exists(ARQUIVO):
            return []

        with open(ARQUIVO, "r", encoding="utf-8") as arquivo:
            return json.load(arquivo)

    def salvar(self, dados):
        with open(ARQUIVO, "w", encoding="utf-8") as arquivo:
            json.dump(
                dados,
                arquivo,
                indent=4,
                ensure_ascii=False
            )

    def adicionar(self, transacao):
        dados = self.carregar()

        dados.append(transacao)

        self.salvar(dados)

    def saldo(self):
        saldo = 0

        for item in self.carregar():

            if item["tipo"] == "receita":
                saldo += float(item["valor"])
            else:
                saldo -= float(item["valor"])

        return saldo