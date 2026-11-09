import React from 'react';
import { fazerLogin, registrarUsuario } from '../services/api';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modoCadastro: false,
      nome: '',
      email: 'aluno@edu.br',
      senha: '123456',
    };

    this.handleNomeChange = this.handleNomeChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleSenhaChange = this.handleSenhaChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.alternarModo = this.alternarModo.bind(this);
    this.preencherContaTeste = this.preencherContaTeste.bind(this);
  }

  handleNomeChange(event) {
    this.setState({ nome: event.target.value });
  }

  handleEmailChange(event) {
    this.setState({ email: event.target.value });
  }

  handleSenhaChange(event) {
    this.setState({ senha: event.target.value });
  }

  alternarModo(novoModo) {
    if (novoModo) {
      this.setState({
        modoCadastro: true,
        nome: '',
        email: '',
        senha: '',
      });
    } else {
      this.setState({
        modoCadastro: false,
      });
    }
  }

  preencherContaTeste(emailTeste, senhaTeste) {
    this.setState({
      modoCadastro: false,
      email: emailTeste,
      senha: senhaTeste,
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    const { modoCadastro, nome, email, senha } = this.state;

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      this.props.aoNotificar('Informe um endereço de e-mail válido.', true);
      return;
    }

    if (senha.length < 6) {
      this.props.aoNotificar('A senha deve ter pelo menos 6 caracteres.', true);
      return;
    }

    try {
      if (modoCadastro) {
        if (!nome.trim()) {
          this.props.aoNotificar('Informe seu nome completo para criar a conta.', true);
          return;
        }
        const novoUsuario = await registrarUsuario({ nome, email, senha });
        this.props.aoEntrar(novoUsuario);
      } else {
        const usuario = await fazerLogin(email, senha);
        this.props.aoEntrar(usuario);
      }
    } catch (err) {
      this.props.aoNotificar(err.message, true);
    }
  }

  render() {
    const { modoCadastro, nome, email, senha } = this.state;

    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-3">
        <div className="card shadow-sm border-0 w-100" style={{ maxWidth: '440px' }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
              <img src="/favicon.svg" alt="Ícone Portal Acadêmico" width="40" height="40" />
              <div>
                <h1 className="h5 fw-bold mb-0 text-dark">Portal Acadêmico</h1>
                <p className="text-secondary small mb-0">Sistema de Atendimento e Matrículas</p>
              </div>
            </div>

            <div className="d-flex border-bottom mb-3">
              <button
                type="button"
                onClick={() => this.alternarModo(false)}
                className={`btn btn-link text-decoration-none flex-fill pb-2 fw-medium rounded-0 ${
                  !modoCadastro
                    ? 'border-bottom border-2 border-primary text-primary'
                    : 'text-secondary'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => this.alternarModo(true)}
                className={`btn btn-link text-decoration-none flex-fill pb-2 fw-medium rounded-0 ${
                  modoCadastro
                    ? 'border-bottom border-2 border-primary text-primary'
                    : 'text-secondary'
                }`}
              >
                Criar Conta de Aluno
              </button>
            </div>

            <form onSubmit={this.handleSubmit}>
              {modoCadastro && (
                <div className="mb-3">
                  <label className="form-label small fw-medium">Nome Completo</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={this.handleNomeChange}
                    placeholder="Digite seu nome"
                    className="form-control"
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small fw-medium">E-mail Acadêmico</label>
                <input
                  type="email"
                  value={email}
                  onChange={this.handleEmailChange}
                  placeholder="exemplo@edu.br"
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-medium">Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={this.handleSenhaChange}
                  placeholder="Mínimo 6 caracteres"
                  className="form-control"
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 fw-medium">
                {modoCadastro ? 'Cadastrar e Entrar' : 'Entrar no Sistema'}
              </button>
            </form>

            <div className="border-top mt-4 pt-3">
              <p className="text-secondary text-uppercase fw-semibold small mb-2">
                Contas de Teste
              </p>
              <div className="row g-2">
                <div className="col-6">
                  <button
                    type="button"
                    onClick={() => this.preencherContaTeste('aluno@edu.br', '123456')}
                    className="btn btn-outline-secondary btn-sm w-100 text-start"
                  >
                    <span className="fw-bold d-block text-dark">Perfil Estudante</span>
                    <span className="small text-secondary">aluno@edu.br</span>
                  </button>
                </div>

                <div className="col-6">
                  <button
                    type="button"
                    onClick={() => this.preencherContaTeste('instituicao@edu.br', '123456')}
                    className="btn btn-outline-secondary btn-sm w-100 text-start"
                  >
                    <span className="fw-bold d-block text-dark">Perfil Instituição</span>
                    <span className="small text-secondary">instituicao@edu.br</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
