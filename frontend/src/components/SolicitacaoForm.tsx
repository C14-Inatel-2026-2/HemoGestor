import { useState } from 'react'
import type { FormEvent } from 'react'
import type { TipoSanguineo } from '../types/doador'
import type { PrioridadeSolicitacao, SolicitacaoRequest } from '../types/solicitacao'
import {
  ROTULO_PRIORIDADE,
  montarRequisicaoDeSolicitacao,
  validarSolicitacao,
} from '../utils/solicitacao'
import type { DadosSolicitacaoFormulario, ErrosSolicitacao } from '../utils/solicitacao'
import './DoadorForm.css'

const TIPOS_SANGUINEOS: TipoSanguineo[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const PRIORIDADES = Object.keys(ROTULO_PRIORIDADE) as PrioridadeSolicitacao[]

const DADOS_INICIAIS: DadosSolicitacaoFormulario = {
  instituicao: '',
  setor: '',
  tipoSanguineo: '',
  quantidade: '1',
  prioridade: 'NORMAL',
  justificativa: '',
}

interface SolicitacaoFormProps {
  onSubmit: (solicitacao: SolicitacaoRequest) => void
  onCancelar: () => void
  salvando?: boolean
}

function SolicitacaoForm({ onSubmit, onCancelar, salvando = false }: SolicitacaoFormProps) {
  const [dados, setDados] = useState<DadosSolicitacaoFormulario>(DADOS_INICIAIS)
  const [erros, setErros] = useState<ErrosSolicitacao>({})

  function atualizar<K extends keyof DadosSolicitacaoFormulario>(
    campo: K,
    valor: DadosSolicitacaoFormulario[K],
  ) {
    setDados((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const novosErros = validarSolicitacao(dados)
    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) return

    onSubmit(montarRequisicaoDeSolicitacao(dados))
  }

  return (
    <form className="doador-form" onSubmit={handleSubmit} noValidate>
      <div className="doador-form__campos">
        <div className="campo campo--inteiro">
          <label htmlFor="instituicao">Instituição solicitante</label>
          <input
            id="instituicao"
            placeholder="Ex.: Hospital São Lucas"
            value={dados.instituicao}
            onChange={(e) => atualizar('instituicao', e.target.value)}
            aria-invalid={Boolean(erros.instituicao)}
          />
          {erros.instituicao && <span className="campo__erro">{erros.instituicao}</span>}
        </div>

        <div className="campo">
          <label htmlFor="tipoSanguineo">Tipo sanguíneo</label>
          <select
            id="tipoSanguineo"
            value={dados.tipoSanguineo}
            onChange={(e) => atualizar('tipoSanguineo', e.target.value as TipoSanguineo | '')}
            aria-invalid={Boolean(erros.tipoSanguineo)}
          >
            <option value="">Selecione o tipo</option>
            {TIPOS_SANGUINEOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          {erros.tipoSanguineo && <span className="campo__erro">{erros.tipoSanguineo}</span>}
        </div>

        <div className="campo">
          <label htmlFor="quantidade">Quantidade de bolsas</label>
          <input
            id="quantidade"
            type="number"
            min={1}
            value={dados.quantidade}
            onChange={(e) => atualizar('quantidade', e.target.value)}
            aria-invalid={Boolean(erros.quantidade)}
          />
          {erros.quantidade && <span className="campo__erro">{erros.quantidade}</span>}
        </div>

        <div className="campo">
          <label htmlFor="prioridade">Prioridade</label>
          <select
            id="prioridade"
            value={dados.prioridade}
            onChange={(e) => atualizar('prioridade', e.target.value as PrioridadeSolicitacao)}
          >
            {PRIORIDADES.map((prioridade) => (
              <option key={prioridade} value={prioridade}>
                {ROTULO_PRIORIDADE[prioridade]}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="setor">Setor/responsável clínico</label>
          <input
            id="setor"
            placeholder="Ex.: UTI adulto · Dra. Marina"
            value={dados.setor}
            onChange={(e) => atualizar('setor', e.target.value)}
          />
        </div>

        <div className="campo campo--inteiro">
          <label htmlFor="justificativa">Justificativa clínica</label>
          <textarea
            id="justificativa"
            rows={3}
            placeholder="Motivo do pedido e informações relevantes"
            value={dados.justificativa}
            onChange={(e) => atualizar('justificativa', e.target.value)}
          />
        </div>
      </div>

      <div className="doador-form__rodape">
        <span className="doador-form__dica">
          Obrigatórios: instituição, tipo sanguíneo, quantidade e prioridade
        </span>
        <button type="button" className="botao botao--secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="botao botao--primario" disabled={salvando}>
          {salvando ? 'Criando...' : 'Criar solicitação'}
        </button>
      </div>
    </form>
  )
}

export default SolicitacaoForm