import React from 'react';
import { alterarSenha } from '../services/api';
import UsuarioContext from '../context/UsuarioContext';

class MeuPerfil extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: '',
    };

    this.handleSenhaAtualChange = this.handleSenhaAtualChange.bind(this);
    this.handleNovaSenhaChange = this.handleNovaSenhaChange.bind(this);
    this.handleConfirmarSenhaChange = this.handleConfirmarSenhaChange.bind(this);
    this.handleSubmitSenha = this.handleSubmitSenha.bind(this);
  }

  handleSenhaAtualChange(event) {
    this.setState({ senhaAtual: event.target.value });
  }

  handleNovaSenhaChange(event) {
    this.setState({ novaSenha: event.target.value });
  }

  handleConfirmarSenhaChange(event) {
    this.setState({ confirmarSenha: event.target.value });
  }

  async handleSubmitSenha(event) {
    event.preventDefault();
    const usuario = this.context;
    const { senhaAtual, novaSenha, confirmarSenha } = this.state;

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      this.props.aoNotificar('Preencha todos os campos para alterar a senha.', true);
      return;
    }

    if (novaSenha.length < 6) {
      this.props.aoNotificar('A nova senha deve ter pelo menos 6 caracteres.', true);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      this.props.aoNotificar('A confirmação da nova senha não confere.', true);
      return;
    }

    try {
      await alterarSenha({
        usuarioId: usuario.id,
        senhaAtual,
        novaSenha,
      });
      this.setState({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
      });
      this.props.aoNotificar('Senha alterada com sucesso!', false);
    } catch (err) {
      this.props.aoNotificar(err.message, true);
    }
  }

  render() {
    const usuario = this.context;
    const { senhaAtual, novaSenha, confirmarSenha } = this.state;

    return (
      <div className="row g-4">
        <div className="col-12 col-md-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold mb-3 text-dark">Meus Dados</h2>

              <ul className="list-group list-group-flush small">
                <li className="list-group-item px-0 py-2">
                  <span className="text-secondary d-block">Nome Completo</span>
                  <strong className="text-dark">{usuario.nome}</strong>
                </li>
                <li className="list-group-item px-0 py-2">
                  <span className="text-secondary d-block">
                    {usuario.perfil === 'instituicao'
                      ? 'Registro Administrativo'
                      : 'Número de Matrícula'}
                  </span>
                  <strong className="text-dark">{usuario.matricula}</strong>
                </li>
                <li className="list-group-item px-0 py-2">
                  <span className="text-secondary d-block">E-mail Acadêmico</span>
                  <strong className="text-dark">{usuario.email}</strong>
                </li>
                <li className="list-group-item px-0 py-2">
                  <span className="text-secondary d-block">Perfil de Acesso</span>
                  <strong className="text-dark">
                    {usuario.perfil === 'instituicao' ? 'Instituição' : 'Estudante'}
                  </strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold mb-3 text-dark">Alterar Senha</h2>

              <form onSubmit={this.handleSubmitSenha}>
                <div className="mb-3">
                  <label className="form-label small fw-medium">Senha Atual</label>
                  <input
                    type="password"
                    value={senhaAtual}
                    onChange={this.handleSenhaAtualChange}
                    placeholder="Digite sua senha atual"
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-medium">Nova Senha</label>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={this.handleNovaSenhaChange}
                    placeholder="Mínimo 6 caracteres"
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-medium">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={this.handleConfirmarSenhaChange}
                    placeholder="Repita a nova senha"
                    className="form-control"
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100 fw-medium">
                  Salvar Nova Senha
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

MeuPerfil.contextType = UsuarioContext;

export default MeuPerfil;
