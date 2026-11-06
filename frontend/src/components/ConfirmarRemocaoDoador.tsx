import { useEffect } from 'react'
import './DoadorForm.css'
import './ConfirmarRemocaoDoador.css'

interface ConfirmarRemocaoDoadorProps {
  nome: string
  removendo: boolean
  erro: string | null
  onConfirmar: () => void
  onCancelar: () => void
}

function ConfirmarRemocaoDoador({
  nome,
  removendo,
  erro,
  onConfirmar,
  onCancelar,
}: ConfirmarRemocaoDoadorProps) {
  useEffect(() => {
    function aoApertarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape' && !removendo) {
        onCancelar()
      }
    }

    document.addEventListener('keydown', aoApertarTecla)
    return () => document.removeEventListener('keydown', aoApertarTecla)
  }, [removendo, onCancelar])

  return (
    <div className="confirmacao__fundo" onClick={removendo ? undefined : onCancelar}>
      <div
        className="confirmacao"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmacao-titulo"
        aria-describedby="confirmacao-texto"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 id="confirmacao-titulo" className="confirmacao__titulo">
          Remover doador
        </h2>
        <p id="confirmacao-texto" className="confirmacao__texto">
          Tem certeza que deseja remover <strong>{nome}</strong>? Essa ação não pode ser desfeita.
        </p>

        {erro && (
          <p role="alert" className="doadores__erro">
            {erro}
          </p>
        )}

        <div className="confirmacao__acoes">
          <button
            type="button"
            className="botao botao--secundario"
            onClick={onCancelar}
            disabled={removendo}
            autoFocus
          >
            Cancelar
          </button>
          <button
            type="button"
            className="botao botao--primario"
            onClick={onConfirmar}
            disabled={removendo}
          >
            {removendo ? 'Removendo...' : 'Remover'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmarRemocaoDoador