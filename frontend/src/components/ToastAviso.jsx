function ToastAviso(props) {
  const { aviso, aoFechar } = props;

  if (!aviso || !aviso.texto) {
    return null;
  }

  return (
    <div className="toast-container position-fixed top-0 end-0 p-3 toast-lateral">
      <div
        className={`toast show shadow border-0 ${
          aviso.erro
            ? 'border-start border-4 border-danger'
            : 'border-start border-4 border-success'
        }`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="toast-header bg-white">
          <span className={`badge me-2 ${aviso.erro ? 'bg-danger' : 'bg-success'}`}>
            {aviso.erro ? 'Atenção' : 'Sucesso'}
          </span>
          <strong className="me-auto text-dark">Portal Acadêmico</strong>
          <button type="button" className="btn-close" onClick={aoFechar} aria-label="Fechar" />
        </div>
        <div className="toast-body bg-white text-dark small">{aviso.texto}</div>
      </div>
    </div>
  );
}

export default ToastAviso;
