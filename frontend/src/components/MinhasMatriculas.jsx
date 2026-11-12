import React from 'react';
import { cancelarMatricula, formatarData, LIMITE_CREDITOS_SEMESTRE } from '../services/api';
import UsuarioContext from '../context/UsuarioContext';

const DIAS_SEMANA = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];

const TURNOS = ['Manhã', 'Tarde', 'Noite'];

class MinhasMatriculas extends React.Component {
  constructor(props) {
    super(props);
    this.cancelar = this.cancelar.bind(this);
  }

  async cancelar(idMatricula, nomeDisciplina) {
    try {
      await cancelarMatricula(idMatricula);
      this.props.aoNotificar(`Matrícula em "${nomeDisciplina}" cancelada.`, false);
      this.props.aoCancelar();
    } catch (err) {
      this.props.aoNotificar(err.message, true);
    }
  }

  render() {
    const usuario = this.context;
    const { disciplinas, matriculas } = this.props;
    const concluidasIds = usuario.disciplinasConcluidasIds || [];
    const minhas = (matriculas || []).filter((m) => m.usuarioId === usuario.id);
    const totalCreditos = minhas.reduce((acc, m) => acc + (Number(m.creditos) || 4), 0);

    const disciplinasConcluidas = (disciplinas || []).filter((d) =>
      concluidasIds.includes(Number(d.id)),
    );

    return (
      <div className="d-flex flex-column gap-4">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h2 className="h5 fw-bold mb-1 text-dark">
              Grade de Horários Semanal — Semestre Atual
            </h2>
            <p className="small text-secondary mb-3">
              Distribuição das suas disciplinas matriculadas durante a semana e o semestre.
            </p>

            <div className="table-responsive">
              <table className="table table-bordered align-middle text-center mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '100px' }}>Turno</th>
                    {DIAS_SEMANA.map((dia) => (
                      <th key={dia} style={{ minWidth: '140px' }}>
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TURNOS.map((turno) => (
                    <tr key={turno}>
                      <td className="fw-semibold bg-light text-dark">{turno}</td>
                      {DIAS_SEMANA.map((dia) => {
                        const aula = minhas.find((m) => m.diaSemana === dia && m.turno === turno);

                        return (
                          <td key={`${dia}-${turno}`} className="p-2">
                            {aula ? (
                              <div className="p-2 rounded bg-primary-subtle border border-primary-subtle text-start">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="codigo-horario">{aula.codigoTurma}</span>
                                  <span className="text-primary fw-semibold">
                                    {aula.creditos || 4} cr
                                  </span>
                                </div>
                                <div className="fw-bold text-dark lh-sm mb-1">
                                  {aula.disciplina}
                                </div>
                                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                  Prof. {aula.professor}
                                </div>
                                <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                                  Até {formatarData(aula.dataFim)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-secondary opacity-50">Livre</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h2 className="h5 fw-bold mb-1 text-dark">Comprovante de Matrícula — Semestre Atual</h2>
            <p className="small text-secondary mb-4">
              Estudante: <strong>{usuario.nome}</strong> • Matrícula:{' '}
              <strong>{usuario.matricula}</strong> • E-mail: {usuario.email}
            </p>

            {minhas.length === 0 ? (
              <div className="text-center py-4 bg-light rounded border">
                <p className="text-secondary mb-0">
                  Você não possui disciplinas em andamento neste semestre.
                </p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover align-middle small">
                    <thead className="table-light">
                      <tr>
                        <th>Turma</th>
                        <th>Disciplina</th>
                        <th>Créditos</th>
                        <th>Professor</th>
                        <th>Horário</th>
                        <th>Término</th>
                        <th className="text-end">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {minhas.map((m) => (
                        <tr key={m.id}>
                          <td>
                            <span className="codigo-horario">{m.codigoTurma}</span>
                          </td>
                          <td className="fw-medium">{m.disciplina}</td>
                          <td>{m.creditos || 4} cr</td>
                          <td>{m.professor}</td>
                          <td>
                            {m.diaSemana} ({m.turno})
                          </td>
                          <td>{formatarData(m.dataFim)}</td>
                          <td className="text-end">
                            <button
                              type="button"
                              onClick={() => this.cancelar(m.id, m.disciplina)}
                              className="btn btn-outline-danger btn-sm py-0 px-2"
                            >
                              Cancelar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 p-3 bg-light rounded border d-flex flex-wrap justify-content-between align-items-center gap-2 small">
                  <span>
                    Total de disciplinas no semestre: <strong>{minhas.length}</strong>
                  </span>
                  <span>
                    Total de créditos:{' '}
                    <strong>
                      {totalCreditos} / {LIMITE_CREDITOS_SEMESTRE} créditos
                    </strong>
                  </span>
                  <span className="text-success fw-semibold">Situação: Matrícula Confirmada</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h3 className="h6 fw-bold mb-1 text-dark">
              Histórico de Disciplinas Concluídas (Ciclo Automático)
            </h3>
            <p className="small text-secondary mb-3">
              As disciplinas em andamento são concluídas automaticamente pelo sistema ao atingir a
              data final da turma, liberando as disciplinas seguintes que dependem de pré-requisito.
            </p>

            {disciplinasConcluidas.length === 0 ? (
              <p className="small text-secondary mb-0">
                Nenhuma disciplina concluída em semestres anteriores.
              </p>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {disciplinasConcluidas.map((d) => (
                  <span
                    key={d.id}
                    className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-medium"
                  >
                    ✓ {d.nome} ({d.creditos || 4} cr)
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

MinhasMatriculas.contextType = UsuarioContext;

export default MinhasMatriculas;
