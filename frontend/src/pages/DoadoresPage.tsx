import CabecalhoPagina from '../components/CabecalhoPagina'
import DoadorForm from '../components/DoadorForm'
import { useEffect, useState } from 'react'
import { atualizarDoador, criarDoador, getDoadores } from '../services/doadorService'
import type { Doador, NovoDoador, StatusDoador } from '../types/doador'
import {
  formatarCpf,
  formatarData,
  montarRequisicaoDeEdicao,
  obterIniciais,
  obterMensagemErro,
  paraDadosDoFormulario,
} from '../utils/doador'
import './DoadoresPage.css'

const ROTULO_STATUS: Record<StatusDoador, string> = {
  APTO: 'Apto',
  AGUARDANDO: 'Aguardando',
  INAPTO: 'Inapto',
}

async function buscarDoadores(): Promise<Doador[]> {
  const resposta = await getDoadores()
  if (!Array.isArray(resposta.data)) {
    throw new Error('Resposta inesperada da API')
  }
  return resposta.data
}

function DoadoresPage() {
  const [doadores, setDoadores] = useState<Doador[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [exibindoFormulario, setExibindoFormulario] = useState(false)
  const [doadorEmEdicao, setDoadorEmEdicao] = useState<Doador | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroCadastro, setErroCadastro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  useEffect(() => {
    buscarDoadores()
      .then(setDoadores)
      .catch(() => setErro('Não foi possível carregar os doadores.'))
      .finally(() => setCarregando(false))
  }, [])

  const formularioAberto = exibindoFormulario || doadorEmEdicao !== null

  function abrirFormulario() {
    setSucesso(null)
    setErroCadastro(null)
    setDoadorEmEdicao(null)
    setExibindoFormulario(true)
  }

  function editarDoador(doador: Doador) {
    setSucesso(null)
    setErroCadastro(null)
    setExibindoFormulario(false)
    setDoadorEmEdicao(doador)
  }

  function fecharFormulario() {
    setErroCadastro(null)
    setExibindoFormulario(false)
    setDoadorEmEdicao(null)
  }

  async function salvarDoador(dados: NovoDoador) {
    const editando = doadorEmEdicao !== null
    setSalvando(true)
    setErroCadastro(null)

    try {
      if (doadorEmEdicao) {
        await atualizarDoador(doadorEmEdicao.id, montarRequisicaoDeEdicao(doadorEmEdicao, dados))
      } else {
        await criarDoador(dados)
      }
    } catch (falha) {
      const mensagemPadrao = editando
        ? 'Não foi possível atualizar o doador.'
        : 'Não foi possível cadastrar o doador.'
      setErroCadastro(obterMensagemErro(falha, mensagemPadrao))
      setSalvando(false)
      return
    }

    fecharFormulario()
    setSucesso(editando ? 'Doador atualizado com sucesso.' : 'Doador cadastrado com sucesso.')
    setSalvando(false)

    try {
      setDoadores(await buscarDoadores())
      setErro(null)
    } catch {
      setErro('Não foi possível carregar os doadores.')
    }
  }

  return (
    <section className="doadores">
      <CabecalhoPagina titulo="Doadores" subtitulo="Cadastro e acompanhamento de doadores" />
      <div className="doadores__conteudo">
        <div className="doadores__barra">
          <span className="doadores__contagem">{doadores.length} doadores</span>
          {!formularioAberto && (
            <button
              type="button"
              className="botao botao--primario doadores__novo"
              onClick={abrirFormulario}
            >
              Novo doador
            </button>
          )}
        </div>

        {sucesso && (
          <p role="status" className="doadores__sucesso">
            {sucesso}
          </p>
        )}

        {erro && (
          <p role="alert" className="doadores__erro">
            {erro}
          </p>
        )}

        {formularioAberto && (
          <div className="tabela-card doadores__formulario">
            <h2 className="doadores__formulario-titulo">
              {doadorEmEdicao ? 'Editar doador' : 'Novo doador'}
            </h2>
            {erroCadastro && (
              <p role="alert" className="doadores__erro">
                {erroCadastro}
              </p>
            )}
            <DoadorForm
              key={doadorEmEdicao?.id ?? 'novo'}
              onSubmit={salvarDoador}
              onCancelar={fecharFormulario}
              salvando={salvando}
              doadorInicial={doadorEmEdicao ? paraDadosDoFormulario(doadorEmEdicao) : undefined}
              textoSalvar={doadorEmEdicao ? 'Salvar alterações' : undefined}
            />
          </div>
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
                <th>Ações</th>
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
                  <td>
                    <button
                      type="button"
                      className="botao botao--secundario doadores__editar"
                      aria-label={`Editar ${doador.nome}`}
                      onClick={() => editarDoador(doador)}
                    >
                      Editar
                    </button>
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