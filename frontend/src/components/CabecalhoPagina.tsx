import './CabecalhoPagina.css'

interface CabecalhoPaginaProps {
  titulo: string
  subtitulo: string
}

function CabecalhoPagina({ titulo, subtitulo }: CabecalhoPaginaProps) {
  return (
    <header className="cabecalho-pagina">
      <h1>{titulo}</h1>
      <p>{subtitulo}</p>
    </header>
  )
}

export default CabecalhoPagina