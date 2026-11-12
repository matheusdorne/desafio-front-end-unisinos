import React from 'react';
import Login from './components/Login';
import CadastroTurma from './components/CadastroTurma';
import RealizarMatricula from './components/RealizarMatricula';
import MinhasMatriculas from './components/MinhasMatriculas';
import MeuPerfil from './components/MeuPerfil';
import ToastAviso from './components/ToastAviso';
import ErrorBoundary from './components/ErrorBoundary';
import UsuarioContext from './context/UsuarioContext';
import {
  buscarDisciplinas,
  buscarProfessores,
  buscarTurmas,
  buscarMatriculas,
  buscarUsuario,
} from './services/api';

const CHAVE_SESSAO = 'portal_usuario_logado';

function Cabecalho(props) {
  const { usuario, aoSair } = props;
  return (
    <header className="topo-portal p-3 shadow-sm">
      <div className="container container-portal d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <img src="/favicon.svg" alt="Ícone" width="28" height="28" />
          <h1 className="h5 fw-bold mb-0">Portal Acadêmico</h1>
        </div>

        <div className="d-flex align-items-center gap-3 small">
          <span>
            <strong>{usuario.nome}</strong>{' '}
            <span className="text-light opacity-75 ms-1">
              •{' '}
              {usuario.perfil === 'instituicao' ? 'Instituição' : `Matrícula ${usuario.matricula}`}
            </span>
          </span>
          <button type="button" onClick={aoSair} className="btn btn-outline-light btn-sm py-1 px-2">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}

function MenuNavegacao(props) {
  const { perfil, abaAtiva, aoTrocarAba } = props;
  return (
    <nav className="bg-white border-bottom">
      <div className="container container-portal d-flex flex-wrap gap-2 p-2">
        {perfil === 'aluno' ? (
          <>
            <button
              type="button"
              onClick={() => aoTrocarAba('matricula')}
              className={`btn btn-sm px-3 py-2 fw-medium ${
                abaAtiva === 'matricula' ? 'btn-primary' : 'btn-light text-secondary'
              }`}
            >
              Fazer Matrícula
            </button>

            <button
              type="button"
              onClick={() => aoTrocarAba('comprovante')}
              className={`btn btn-sm px-3 py-2 fw-medium ${
                abaAtiva === 'comprovante' ? 'btn-primary' : 'btn-light text-secondary'
              }`}
            >
              Minhas Matrículas
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => aoTrocarAba('admin')}
            className={`btn btn-sm px-3 py-2 fw-medium ${
              abaAtiva === 'admin' ? 'btn-primary' : 'btn-light text-secondary'
            }`}
          >
            Gestão e Oferta de Turmas
          </button>
        )}

        <button
          type="button"
          onClick={() => aoTrocarAba('perfil')}
          className={`btn btn-sm px-3 py-2 fw-medium ${
            abaAtiva === 'perfil' ? 'btn-primary' : 'btn-light text-secondary'
          }`}
        >
          Meu Perfil
        </button>
      </div>
    </nav>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    const salvo = localStorage.getItem(CHAVE_SESSAO);
    const usuarioSalvo = salvo ? JSON.parse(salvo) : null;

    this.state = {
      usuario: usuarioSalvo,
      abaAtiva: usuarioSalvo?.perfil === 'instituicao' ? 'admin' : 'matricula',
      disciplinas: [],
      professores: [],
      turmas: [],
      matriculas: [],
      aviso: { texto: '', erro: false },
    };

    this.timerAviso = null;
    this.carregarDados = this.carregarDados.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.trocarAba = this.trocarAba.bind(this);
    this.mostrarAviso = this.mostrarAviso.bind(this);
    this.fecharAviso = this.fecharAviso.bind(this);
  }

  componentDidMount() {
    this.carregarDados();
  }

  componentWillUnmount() {
    if (this.timerAviso) {
      clearTimeout(this.timerAviso);
    }
  }

  async carregarDados() {
    const listaDisciplinas = await buscarDisciplinas();
    const listaProfessores = await buscarProfessores();
    const listaTurmas = await buscarTurmas();
    const listaMatriculas = await buscarMatriculas();
    const { usuario } = this.state;

    let usuarioAtualizado = usuario;
    if (usuario?.id) {
      const dadosUsuario = await buscarUsuario(usuario.id);
      if (dadosUsuario) {
        usuarioAtualizado = dadosUsuario;
        localStorage.setItem(CHAVE_SESSAO, JSON.stringify(dadosUsuario));
      }
    }

    this.setState({
      usuario: usuarioAtualizado,
      disciplinas: listaDisciplinas,
      professores: listaProfessores,
      turmas: listaTurmas,
      matriculas: listaMatriculas,
    });
  }

  mostrarAviso(texto, erro = false) {
    if (this.timerAviso) {
      clearTimeout(this.timerAviso);
    }
    this.setState({ aviso: { texto, erro } });
    this.timerAviso = setTimeout(() => {
      this.setState({ aviso: { texto: '', erro: false } });
    }, 4000);
  }

  fecharAviso() {
    if (this.timerAviso) {
      clearTimeout(this.timerAviso);
    }
    this.setState({ aviso: { texto: '', erro: false } });
  }

  handleLogin(dadosUsuario) {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(dadosUsuario));
    this.setState({
      usuario: dadosUsuario,
      abaAtiva: dadosUsuario.perfil === 'instituicao' ? 'admin' : 'matricula',
      aviso: { texto: '', erro: false },
    });
  }

  handleLogout() {
    localStorage.removeItem(CHAVE_SESSAO);
    this.setState({
      usuario: null,
      aviso: { texto: '', erro: false },
    });
  }

  trocarAba(novaAba) {
    this.setState({ abaAtiva: novaAba });
  }

  render() {
    const { usuario, abaAtiva, disciplinas, professores, turmas, matriculas, aviso } = this.state;

    if (!usuario) {
      return (
        <>
          <ToastAviso aviso={aviso} aoFechar={this.fecharAviso} />
          <Login aoEntrar={this.handleLogin} aoNotificar={this.mostrarAviso} />
        </>
      );
    }

    return (
      <UsuarioContext.Provider value={usuario}>
        <div className="min-vh-100">
          <ToastAviso aviso={aviso} aoFechar={this.fecharAviso} />
          <Cabecalho usuario={usuario} aoSair={this.handleLogout} />
          <MenuNavegacao perfil={usuario.perfil} abaAtiva={abaAtiva} aoTrocarAba={this.trocarAba} />

          <main className="container container-portal p-3 mt-3">
            <ErrorBoundary>
              {abaAtiva === 'matricula' && (
                <RealizarMatricula
                  disciplinas={disciplinas}
                  turmas={turmas}
                  matriculas={matriculas}
                  aoMatricular={this.carregarDados}
                  aoNotificar={this.mostrarAviso}
                />
              )}

              {abaAtiva === 'comprovante' && (
                <MinhasMatriculas
                  disciplinas={disciplinas}
                  matriculas={matriculas}
                  aoCancelar={this.carregarDados}
                  aoNotificar={this.mostrarAviso}
                />
              )}

              {abaAtiva === 'admin' && (
                <CadastroTurma
                  disciplinas={disciplinas}
                  professores={professores}
                  turmas={turmas}
                  matriculas={matriculas}
                  aoCadastrar={this.carregarDados}
                  aoNotificar={this.mostrarAviso}
                />
              )}

              {abaAtiva === 'perfil' && <MeuPerfil aoNotificar={this.mostrarAviso} />}
            </ErrorBoundary>
          </main>
        </div>
      </UsuarioContext.Provider>
    );
  }
}

export default App;
