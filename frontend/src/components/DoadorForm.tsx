import { useState } from 'react'
import type { FormEvent } from 'react'
import type { NovoDoador, Sexo, TipoSanguineo } from '../types/doador'
import { validarCpf } from '../utils/doador'
import './DoadorForm.css'

const TIPOS_SANGUINEOS: TipoSanguineo[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

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
}

interface DoadorFormProps {
  onSubmit: (doador: NovoDoador) => void
  onCancelar: () => void
}

function DoadorForm({ onSubmit, onCancelar }: DoadorFormProps) {
  const [dados, setDados] = useState<NovoDoador>(DOADOR_VAZIO)
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
          />
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
          >
            <option value="">Não informado</option>
            {TIPOS_SANGUINEOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="telefone">Telefone</label>
          <input
            id="telefone"
            type="tel"
            placeholder="(00) 00000-0000"
            value={dados.telefone}
            onChange={(e) => atualizar('telefone', e.target.value)}
          />
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
        <span className="doador-form__dica">Campos obrigatórios: nome e CPF</span>
        <button type="button" className="botao botao--secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="botao botao--primario">
          Salvar doador
        </button>
      </div>
    </form>
  )
}

export default DoadorForm