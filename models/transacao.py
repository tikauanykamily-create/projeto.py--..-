class Transacao:
    def __init__(self, tipo, descricao, valor, categoria):
        self.tipo = tipo
        self.descricao = descricao
        self.valor = valor
        self.categoria = categoria

    def to_dict(self):
        return {
            "tipo": self.tipo,
            "descricao": self.descricao,
            "valor": self.valor,
            "categoria": self.categoria
        }