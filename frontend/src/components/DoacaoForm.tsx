import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Doacao, DoacaoRequest, TipoDoacao } from '../types/doacao'
import type { Doador } from '../types/doador'
import {
  ROTULO_TIPO_DOACAO,
  dataDeHoje,
  dataLiberadaParaDoar,
  montarRequisicaoDeDoacao,
  validarDoacao,
  verificarElegibilidade,
} from '../utils/doacao'
import type { DadosDoacaoFormulario, ErrosDoacao } from '../utils/doacao'
import { formatarCpf, formatarData } from '../utils/doador'
import './DoadorForm.css'

const TIPOS_DOACAO = Object.keys(ROTULO_TIPO_DOACAO) as TipoDoacao[]

const ROTULO_STATUS_DOADOR = {
  APTO: 'Apto',
  AGUARDANDO: 'Aguardando',
  INAPTO: 'Inapto',
} as const

function dadosIniciais(): DadosDoacaoFormulario {
  const agora = new Date()
  return {
    doadorId: '',
    dataColeta: dataDeHoje(),
    horaColeta: `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`,
    volume_ml: '450',
    tipoDoacao: 'SANGUE_TOTAL',
    pressaoArterial: '',
    hemoglobina: '',
    sala: '',
    responsavel: '',
    intercorrencia: '',
  }
}

interface DoacaoFormProps {
  doadores: Doador[]
  doacoes?: Doacao[]
  onSubmit: (doacao: DoacaoRequest) => void
  onCancelar: () => void
  salvando?: boolean
}

function DoacaoForm({
  doadores,
  doacoes = [],
  onSubmit,
  onCancelar,
  salvando = false,
}: DoacaoFormProps) {
  const [dados, setDados] = useState<DadosDoacaoFormulario>(dadosIniciais)
  const [erros, setErros] = useState<ErrosDoacao>({})
  const hoje = dataDeHoje()

  function atualizar<K extends keyof DadosDoacaoFormulario>(
    campo: K,
    valor: DadosDoacaoFormulario[K],
  ) {
    setDados((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const novosErros = validarDoacao(dados)
    const doadorEscolhido = doadores.find((doador) => String(doador.id) === dados.doadorId)
    if (doadorEscolhido && !novosErros.dataColeta) {
      const motivo = verificarElegibilidade(doadorEscolhido, doacoes, dados.dataColeta)
      if (motivo) novosErros.dataColeta = motivo
    }
    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) return

    onSubmit(montarRequisicaoDeDoacao(dados))
  }

  return (
    <form className="doador-form" onSubmit={handleSubmit} noValidate>
      <div className="doador-form__campos">
        <div className="campo campo--inteiro">
          <label htmlFor="doadorId">Doador</label>
          <select
            id="doadorId"
            value={dados.doadorId}
            onChange={(e) => atualizar('doadorId', e.target.value)}
            aria-invalid={Boolean(erros.doadorId)}
          >
            <option value="">Selecione o doador</option>
            {doadores.map((doador) => {
              const liberadaEm = dataLiberadaParaDoar(doador, doacoes)
              const aguardandoIntervalo = liberadaEm !== null && liberadaEm > hoje
              const indisponivel = doador.status !== 'APTO' || aguardandoIntervalo
              let observacao = ''
              if (doador.status !== 'APTO') {
                observacao = ` (${ROTULO_STATUS_DOADOR[doador.status]})`
              } else if (aguardandoIntervalo) {
                observacao = ` (disponível em ${formatarData(liberadaEm)})`
              }

              return (
                <option key={doador.id} value={String(doador.id)} disabled={indisponivel}>
                  {doador.nome} · {formatarCpf(doador.cpf)} · {doador.tipo_sanguineo ?? 'Tipo não informado'}
                  {observacao}
                </option>
              )
            })}
          </select>
          {erros.doadorId && <span className="campo__erro">{erros.doadorId}</span>}
        </div>

        <div className="campo">
          <label htmlFor="dataColeta">Data da coleta</label>
          <input
            id="dataColeta"
            type="date"
            value={dados.dataColeta}
            onChange={(e) => atualizar('dataColeta', e.target.value)}
            aria-invalid={Boolean(erros.dataColeta)}
          />
          {erros.dataColeta && <span className="campo__erro">{erros.dataColeta}</span>}
        </div>

        <div className="campo">
          <label htmlFor="horaColeta">Hora da coleta</label>
          <input
            id="horaColeta"
            type="time"
            value={dados.horaColeta}
            onChange={(e) => atualizar('horaColeta', e.target.value)}
            aria-invalid={Boolean(erros.horaColeta)}
          />
          {erros.horaColeta && <span className="campo__erro">{erros.horaColeta}</span>}
        </div>

        <div className="campo">
          <label htmlFor="tipoDoacao">Tipo de doação</label>
          <select
            id="tipoDoacao"
            value={dados.tipoDoacao}
            onChange={(e) => atualizar('tipoDoacao', e.target.value as TipoDoacao)}
          >
            {TIPOS_DOACAO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {ROTULO_TIPO_DOACAO[tipo]}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="volume_ml">Volume (ml)</label>
          <input
            id="volume_ml"
            type="number"
            min={1}
            value={dados.volume_ml}
            onChange={(e) => atualizar('volume_ml', e.target.value)}
            aria-invalid={Boolean(erros.volume_ml)}
          />
          {erros.volume_ml && <span className="campo__erro">{erros.volume_ml}</span>}
        </div>

        <div className="campo">
          <label htmlFor="pressaoArterial">Pressão arterial</label>
          <input
            id="pressaoArterial"
            placeholder="Ex.: 120/80"
            value={dados.pressaoArterial}
            onChange={(e) => atualizar('pressaoArterial', e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="hemoglobina">Hemoglobina (g/dL)</label>
          <input
            id="hemoglobina"
            inputMode="decimal"
            placeholder="Ex.: 14,2"
            value={dados.hemoglobina}
            onChange={(e) => atualizar('hemoglobina', e.target.value)}
            aria-invalid={Boolean(erros.hemoglobina)}
          />
          {erros.hemoglobina && <span className="campo__erro">{erros.hemoglobina}</span>}
        </div>

        <div className="campo">
          <label htmlFor="sala">Sala</label>
          <input
            id="sala"
            placeholder="Ex.: Sala 1"
            value={dados.sala}
            onChange={(e) => atualizar('sala', e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="responsavel">Responsável</label>
          <input
            id="responsavel"
            placeholder="Ex.: Enf. Carla"
            value={dados.responsavel}
            onChange={(e) => atualizar('responsavel', e.target.value)}
            aria-invalid={Boolean(erros.responsavel)}
          />
          {erros.responsavel && <span className="campo__erro">{erros.responsavel}</span>}
        </div>

        <div className="campo campo--inteiro">
          <label htmlFor="intercorrencia">Intercorrências</label>
          <textarea
            id="intercorrencia"
            rows={3}
            placeholder="Reações, dificuldades na coleta ou observações"
            value={dados.intercorrencia}
            onChange={(e) => atualizar('intercorrencia', e.target.value)}
          />
        </div>
      </div>

      <div className="doador-form__rodape">
        <span className="doador-form__dica">
          Obrigatórios: doador, data, hora, volume, hemoglobina e responsável
        </span>
        <button type="button" className="botao botao--secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="botao botao--primario" disabled={salvando}>
          {salvando ? 'Registrando...' : 'Registrar doação'}
        </button>
      </div>
    </form>
  )
}

export default DoacaoForm