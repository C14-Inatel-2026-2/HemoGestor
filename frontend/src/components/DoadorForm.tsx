import { useState } from 'react'
import type { FormEvent } from 'react'
import type { NovoDoador, Sexo, TipoSanguineo } from '../types/doador'
import { validarCpf, validarTelefone } from '../utils/doador'
import './DoadorForm.css'
import { TIPOS_SANGUINEOS } from '../constants/tiposSanguineos'

const DOADOR_VAZIO: NovoDoador = {
  nome: '',
  cpf: '',
  data_nascimento: null,
  sexo: 'NAO_INFORMADO',
  tipo_sanguineo: null,
  telefone: '',
  email: '',
  cidade: '',
  bairro: '',
  observacoes: '',
}

interface ErrosFormulario {
  nome?: string
  cpf?: string
  data_nascimento?: string
  tipo_sanguineo?: string
  telefone?: string
}

interface DoadorFormProps {
  onSubmit: (doador: NovoDoador) => void
  onCancelar: () => void
  salvando?: boolean
  doadorInicial?: NovoDoador
  textoSalvar?: string
}

function DoadorForm({ onSubmit, onCancelar, salvando = false, doadorInicial, textoSalvar = 'Salvar doador',}: DoadorFormProps) {
  const [dados, setDados] = useState<NovoDoador>(doadorInicial ?? DOADOR_VAZIO)
  const [erros, setErros] = useState<ErrosFormulario>({})

  function atualizar<K extends keyof NovoDoador>(campo: K, valor: NovoDoador[K]) {
    setDados((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function validar(): ErrosFormulario {
    const novosErros: ErrosFormulario = {}
    if (!dados.nome.trim()) {
      novosErros.nome = 'Informe o nome do doador.'
    }
    if (!validarCpf(dados.cpf)) {
      novosErros.cpf = 'CPF inválido.'
    }
    if (!dados.data_nascimento) {
      novosErros.data_nascimento = 'Informe a data de nascimento.'
    }
    if (!dados.tipo_sanguineo) {
      novosErros.tipo_sanguineo = 'Selecione o tipo sanguíneo.'
    }
    if (!validarTelefone(dados.telefone)) {
      novosErros.telefone = 'Informe o telefone com DDD.'
    }
    return novosErros
  }

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const novosErros = validar()
    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) return

    onSubmit({
      ...dados,
      nome: dados.nome.trim(),
      cpf: dados.cpf.replace(/\D/g, ''),
      telefone: dados.telefone.replace(/\D/g, ''),
    })
  }

  return (
    <form className="doador-form" onSubmit={handleSubmit} noValidate>
      <div className="doador-form__campos">
        <div className="campo campo--inteiro">
          <label htmlFor="nome">Nome completo</label>
          <input
            id="nome"
            placeholder="Ex.: Ana Beatriz Souza"
            value={dados.nome}
            onChange={(e) => atualizar('nome', e.target.value)}
            aria-invalid={Boolean(erros.nome)}
          />
          {erros.nome && <span className="campo__erro">{erros.nome}</span>}
        </div>

        <div className="campo">
          <label htmlFor="cpf">CPF</label>
          <input
            id="cpf"
            className="campo__mono"
            placeholder="000.000.000-00"
            value={dados.cpf}
            onChange={(e) => atualizar('cpf', e.target.value)}
            aria-invalid={Boolean(erros.cpf)}
          />
          {erros.cpf && <span className="campo__erro">{erros.cpf}</span>}
        </div>

        <div className="campo">
          <label htmlFor="data_nascimento">Data de nascimento</label>
          <input
            id="data_nascimento"
            type="date"
            value={dados.data_nascimento ?? ''}
            onChange={(e) => atualizar('data_nascimento', e.target.value || null)}
            aria-invalid={Boolean(erros.data_nascimento)}
          />
          {erros.data_nascimento && <span className="campo__erro">
        {erros.data_nascimento}</span>}
        </div>

        <div className="campo">
          <label htmlFor="sexo">Sexo</label>
          <select
            id="sexo"
            value={dados.sexo}
            onChange={(e) => atualizar('sexo', e.target.value as Sexo)}
          >
            <option value="FEMININO">Feminino</option>
            <option value="MASCULINO">Masculino</option>
            <option value="NAO_INFORMADO">Prefere não informar</option>
          </select>
        </div>

        <div className="campo">
          <label htmlFor="tipo_sanguineo">Tipo sanguíneo</label>
          <select
            id="tipo_sanguineo"
            value={dados.tipo_sanguineo ?? ''}
            onChange={(e) =>
              atualizar('tipo_sanguineo', (e.target.value || null) as TipoSanguineo | null)
            }
            aria-invalid={Boolean(erros.tipo_sanguineo)}
          >
            <option value="">Selecione o tipo</option>
            {TIPOS_SANGUINEOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          {erros.tipo_sanguineo && <span className="campo__erro">
        {erros.tipo_sanguineo}</span>}
        </div>

        <div className="campo">
          <label htmlFor="telefone">Telefone</label>
          <input
            id="telefone"
            type="tel"
            placeholder="(00) 00000-0000"
            value={dados.telefone}
            onChange={(e) => atualizar('telefone', e.target.value)}
            aria-invalid={Boolean(erros.telefone)}
          />
          {erros.telefone && <span className="campo__erro">{erros.telefone}</span>}
        </div>

        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="nome@email.com"
            value={dados.email}
            onChange={(e) => atualizar('email', e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="cidade">Cidade</label>
          <input
            id="cidade"
            placeholder="Ex.: Pouso Alegre"
            value={dados.cidade}
            onChange={(e) => atualizar('cidade', e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="bairro">Bairro</label>
          <input
            id="bairro"
            placeholder="Ex.: Centro"
            value={dados.bairro}
            onChange={(e) => atualizar('bairro', e.target.value)}
          />
        </div>

        <div className="campo campo--inteiro">
          <label htmlFor="observacoes">Observações</label>
          <textarea
            id="observacoes"
            rows={3}
            placeholder="Restrições, histórico relevante, medicamentos em uso"
            value={dados.observacoes}
            onChange={(e) => atualizar('observacoes', e.target.value)}
          />
        </div>
      </div>

      <div className="doador-form__rodape">
        <span className="doador-form__dica">
          Campos obrigatórios: nome, CPF, data de nascimento e tipo sanguíneo
        </span>
        <button type="button" className="botao botao--secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="botao botao--primario" disabled={salvando}>
          {salvando ? 'Salvando...' : textoSalvar}
        </button>
      </div>
    </form>
  )
}

export default DoadorForm