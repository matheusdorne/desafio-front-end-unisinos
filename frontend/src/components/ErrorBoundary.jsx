import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger m-4">
          <h4 className="alert-heading">Ocorreu um erro ao exibir este componente.</h4>
          <p className="mb-0">Recarregue a página para tentar novamente.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
