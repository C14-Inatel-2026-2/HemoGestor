import { useEffect, useState } from 'react'
import { getDoadores } from '../services/doadorService'
import type { Doador, StatusDoador } from '../types/doador'
import { formatarCpf, formatarData, obterIniciais } from '../utils/doador'
import './DoadoresPage.css'

const ROTULO_STATUS: Record<StatusDoador, string> = {
  APTO: 'Apto',
  AGUARDANDO: 'Aguardando',
  INAPTO: 'Inapto',
}

function DoadoresPage() {
  const [doadores, setDoadores] = useState<Doador[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    getDoadores()
      .then((resposta) => {
        if (!Array.isArray(resposta.data)) {
          throw new Error('Resposta inesperada da API')
        }
        setDoadores(resposta.data)
      })
      .catch(() => setErro('Não foi possível carregar os doadores.'))
      .finally(() => setCarregando(false))
  }, [])

  return (
    <section className="doadores">
      <header className="doadores__cabecalho">
        <h1>Doadores</h1>
        <p>Cadastro e acompanhamento de doadores</p>
      </header>

      <div className="doadores__conteudo">
        <div className="doadores__barra">
          <span className="doadores__contagem">{doadores.length} doadores</span>
        </div>

        {erro && (
          <p role="alert" className="doadores__erro">
            {erro}
          </p>
        )}

        <div className="tabela-card">
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Tipo</th>
                <th>Telefone</th>
                <th>Última doação</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {doadores.map((doador) => (
                <tr key={doador.id}>
                  <td>
                    <div className="doador">
                      <span className="doador__avatar">{obterIniciais(doador.nome)}</span>
                      <div>
                        <div className="doador__nome">{doador.nome}</div>
                        <div className="doador__local">
                          {doador.cidade} · {doador.bairro}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="tabela__mono">{formatarCpf(doador.cpf)}</td>
                  <td>
                    {doador.tipo_sanguineo ? (
                      <span className="selo-tipo">{doador.tipo_sanguineo}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{doador.telefone}</td>
                  <td>{formatarData(doador.ultima_doacao)}</td>
                  <td>
                    <span className={`selo-status selo-status--${doador.status.toLowerCase()}`}>
                      {ROTULO_STATUS[doador.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!carregando && !erro && doadores.length === 0 && (
            <p className="tabela__vazia">Nenhum doador cadastrado.</p>
          )}
          {carregando && <p className="tabela__vazia">Carregando doadores...</p>}
        </div>
      </div>
    </section>
  )
}

export default DoadoresPage