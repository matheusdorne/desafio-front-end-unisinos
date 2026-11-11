import React from 'react';
import { criarMatricula, formatarData, LIMITE_CREDITOS_SEMESTRE } from '../services/api';
import UsuarioContext from '../context/UsuarioContext';

class RealizarMatricula extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filtroStatus: 'Todas',
      filtroTurno: 'Todos',
    };

    this.handleStatusChange = this.handleStatusChange.bind(this);
    this.handleFiltroChange = this.handleFiltroChange.bind(this);
    this.matricular = this.matricular.bind(this);
  }

  handleStatusChange(event) {
    this.setState({ filtroStatus: event.target.value });
  }

  handleFiltroChange(event) {
    this.setState({ filtroTurno: event.target.value });
  }

  async matricular(turmaId) {
    const usuario = this.context;
    const { disciplinas, turmas, matriculas } = this.props;
    const turma = (turmas || []).find((t) => t.id === Number(turmaId));

    if (turma) {
      const concluidasIds = usuario.disciplinasConcluidasIds || [];
      const minhasMatriculas = (matriculas || []).filter((m) => m.usuarioId === usuario.id);
      const disc = (disciplinas || []).find((d) => d.id === Number(turma.disciplinaId));
      const listaPreReq =
        turma.preRequisitosIds && turma.preRequisitosIds.length > 0
          ? turma.preRequisitosIds
          : disc?.preRequisitosIds || [];

      const naoConcluidos = listaPreReq.filter(
        (idPreReq) => !concluidasIds.includes(Number(idPreReq)),
      );
      if (naoConcluidos.length > 0) {
        const cursandoNesteSemestre = naoConcluidos.filter((idPreReq) =>
          minhasMatriculas.some((m) => Number(m.disciplinaId) === Number(idPreReq)),
        );

        if (cursandoNesteSemestre.length > 0) {
          const nomesCursando = cursandoNesteSemestre
            .map((id) => (disciplinas || []).find((d) => d.id === Number(id))?.nome)
            .filter(Boolean)
            .join(', ');
          this.props.aoNotificar(
            `Não é permitido cursar "${turma.disciplina}" no mesmo semestre de seu pré-requisito ("${nomesCursando}"). Aguarde a data final da disciplina de pré-requisito.`,
            true,
          );
          return;
        }

        const nomesPendentes = naoConcluidos
          .map((id) => (disciplinas || []).find((d) => d.id === Number(id))?.nome)
          .filter(Boolean)
          .join(', ');
        this.props.aoNotificar(
          `Pré-requisito pendente: é necessário ter concluído "${nomesPendentes}" em semestre anterior para cursar "${turma.disciplina}".`,
          true,
        );
        return;
      }
    }

    try {
      const dados = await criarMatricula(usuario, turmaId);
      this.props.aoNotificar(`Matrícula em "${dados.disciplina}" realizada!`, false);
      this.props.aoMatricular();
    } catch (err) {
      this.props.aoNotificar(err.message, true);
    }
  }

  render() {
    const usuario = this.context;
    const { disciplinas, turmas, matriculas } = this.props;
    const { filtroStatus, filtroTurno } = this.state;

    const concluidasIds = usuario.disciplinasConcluidasIds || [];
    const minhasMatriculas = (matriculas || []).filter((m) => m.usuarioId === usuario.id);
    const creditosAtuais = minhasMatriculas.reduce((acc, m) => acc + (Number(m.creditos) || 4), 0);

    const turmasFiltradas = turmas.filter((t) => {
      if (filtroTurno !== 'Todos' && t.turno !== filtroTurno) {
        return false;
      }

      if (filtroStatus === 'Disponiveis') {
        const lotada = t.matriculados >= t.vagas;
        const jaConcluida = concluidasIds.includes(Number(t.disciplinaId));
        const jaMatriculado = minhasMatriculas.some(
          (m) => m.turmaId === t.id || (t.disciplinaId && m.disciplinaId === t.disciplinaId),
        );
        const listaPreReq = t.preRequisitosIds || [];
        const cumprePreRequisito = listaPreReq.every((idPreReq) =>
          concluidasIds.includes(Number(idPreReq)),
        );
        const temChoqueHorario = minhasMatriculas.some(
          (m) => m.diaSemana === t.diaSemana && m.turno === t.turno,
        );
        const cabeNosCreditos =
          creditosAtuais + (Number(t.creditos) || 4) <= LIMITE_CREDITOS_SEMESTRE;

        return (
          !lotada &&
          !jaConcluida &&
          !jaMatriculado &&
          cumprePreRequisito &&
          !temChoqueHorario &&
          cabeNosCreditos
        );
      }

      return true;
    });

    return (
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h2 className="h5 fw-bold mb-1 text-dark">Matrícula em Disciplinas</h2>
              <span className="small text-secondary">
                Créditos no semestre:{' '}
                <strong>
                  {creditosAtuais} / {LIMITE_CREDITOS_SEMESTRE} créditos
                </strong>
              </span>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <label className="small fw-medium mb-0">Exibir:</label>
                <select
                  value={filtroStatus}
                  onChange={this.handleStatusChange}
                  className="form-select form-select-sm w-auto"
                >
                  <option value="Todas">Todas as disciplinas</option>
                  <option value="Disponiveis">Apenas disponíveis</option>
                </select>
              </div>

              <div className="d-flex align-items-center gap-2">
                <label className="small fw-medium mb-0">Turno:</label>
                <select
                  value={filtroTurno}
                  onChange={this.handleFiltroChange}
                  className="form-select form-select-sm w-auto"
                >
                  <option value="Todos">Todos</option>
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                </select>
              </div>
            </div>
          </div>

          {turmasFiltradas.length === 0 ? (
            <p className="text-secondary py-3 mb-0">
              Nenhuma disciplina disponível para o filtro selecionado.
            </p>
          ) : (
            <div className="row g-3">
              {turmasFiltradas.map((t) => {
                const lotada = t.matriculados >= t.vagas;
                const jaConcluida = concluidasIds.includes(Number(t.disciplinaId));
                const jaMatriculado = minhasMatriculas.some(
                  (m) =>
                    m.turmaId === t.id || (t.disciplinaId && m.disciplinaId === t.disciplinaId),
                );
                const listaPreReq = t.preRequisitosIds || [];
                const cumprePreRequisito = listaPreReq.every((idPreReq) =>
                  concluidasIds.includes(Number(idPreReq)),
                );
                const temChoqueHorario = minhasMatriculas.some(
                  (m) => m.diaSemana === t.diaSemana && m.turno === t.turno,
                );
                const cabeNosCreditos =
                  creditosAtuais + (Number(t.creditos) || 4) <= LIMITE_CREDITOS_SEMESTRE;
                const disponivelParaAluno =
                  !lotada &&
                  !jaConcluida &&
                  !jaMatriculado &&
                  cumprePreRequisito &&
                  !temChoqueHorario &&
                  cabeNosCreditos;
                const nomesPreReq = listaPreReq
                  .map((id) => (disciplinas || []).find((d) => d.id === id)?.nome)
                  .filter(Boolean)
                  .join(', ');

                return (
                  <div key={t.id} className="col-12 col-md-6">
                    <div className="border rounded p-3 h-100 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <h3 className="h6 fw-bold text-dark mb-1">{t.disciplina}</h3>
                          <span
                            className={`badge ${
                              jaConcluida
                                ? 'bg-secondary-subtle text-secondary'
                                : jaMatriculado
                                  ? 'bg-primary-subtle text-primary'
                                  : disponivelParaAluno
                                    ? 'bg-success-subtle text-success'
                                    : 'bg-danger-subtle text-danger'
                            }`}
                          >
                            {jaConcluida
                              ? 'Concluída'
                              : jaMatriculado
                                ? 'Matriculado'
                                : disponivelParaAluno
                                  ? 'Disponível'
                                  : 'Indisponível'}
                          </span>
                        </div>
                        <p className="small text-secondary mb-1 mt-1">
                          Professor: {t.professor} • <strong>{t.creditos || 4} créditos</strong>
                        </p>
                        <p className="small text-secondary mb-0">
                          Turma: <span className="codigo-horario">{t.codigoTurma}</span> •{' '}
                          {t.diaSemana}, {t.turno} • Término: {formatarData(t.dataFim)}
                        </p>
                        {nomesPreReq && (
                          <p className="small text-secondary mb-0 mt-1">
                            Pré-requisitos: <strong>{nomesPreReq}</strong>
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => this.matricular(t.id)}
                        disabled={jaConcluida || jaMatriculado || lotada}
                        className={`btn btn-sm mt-3 w-100 fw-medium ${
                          jaConcluida
                            ? 'btn-outline-secondary disabled'
                            : jaMatriculado
                              ? 'btn-outline-primary disabled'
                              : lotada
                                ? 'btn-secondary disabled'
                                : 'btn-success'
                        }`}
                      >
                        {jaConcluida
                          ? 'Já Concluída'
                          : jaMatriculado
                            ? 'Já Matriculado'
                            : lotada
                              ? 'Indisponível'
                              : 'Realizar Matrícula'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
}

RealizarMatricula.contextType = UsuarioContext;

export default RealizarMatricula;
