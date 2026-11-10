import React from 'react';
import {
  cadastrarDisciplina,
  cadastrarProfessor,
  cadastrarTurma,
  atualizarDataFimTurma,
  cancelarMatricula,
  formatarData,
  obterDataFimPadraoSemestre,
  LIMITE_TURMAS_PROFESSOR,
} from '../services/api';

class CadastroTurma extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nomeDisciplina: '',
      creditosDisciplina: 4,
      preRequisitosSelecionados: [],
      nomeProfessor: '',
      disciplinasSelecionadas: [],
      disciplinaId: '',
      professorId: '',
      turno: 'Noite',
      diaSemana: 'Segunda-feira',
      dataFim: obterDataFimPadraoSemestre(),
      vagas: 30,
      turmaSelecionadaId: 1,
    };

    this.handleNomeDisciplinaChange = this.handleNomeDisciplinaChange.bind(this);
    this.handleCreditosDisciplinaChange = this.handleCreditosDisciplinaChange.bind(this);
    this.alternarPreRequisito = this.alternarPreRequisito.bind(this);
    this.handleSubmitDisciplina = this.handleSubmitDisciplina.bind(this);
    this.handleNomeProfessorChange = this.handleNomeProfessorChange.bind(this);
    this.alternarDisciplinaProfessor = this.alternarDisciplinaProfessor.bind(this);
    this.handleSubmitProfessor = this.handleSubmitProfessor.bind(this);
    this.handleDisciplinaTurmaChange = this.handleDisciplinaTurmaChange.bind(this);
    this.handleProfessorChange = this.handleProfessorChange.bind(this);
    this.handleTurnoChange = this.handleTurnoChange.bind(this);
    this.handleDiaSemanaChange = this.handleDiaSemanaChange.bind(this);
    this.handleDataFimChange = this.handleDataFimChange.bind(this);
    this.handleVagasChange = this.handleVagasChange.bind(this);
    this.handleSubmitTurma = this.handleSubmitTurma.bind(this);
    this.alterarDataFimTurma = this.alterarDataFimTurma.bind(this);
    this.selecionarTurma = this.selecionarTurma.bind(this);
    this.removerAlunoDaTurma = this.removerAlunoDaTurma.bind(this);
  }

  handleNomeDisciplinaChange(event) {
    this.setState({ nomeDisciplina: event.target.value });
  }

  handleCreditosDisciplinaChange(event) {
    this.setState({ creditosDisciplina: event.target.value });
  }

  alternarPreRequisito(idDisciplina) {
    this.setState((estadoAnterior) => {
      const jaSelecionado = estadoAnterior.preRequisitosSelecionados.includes(idDisciplina);
      const novaLista = jaSelecionado
        ? estadoAnterior.preRequisitosSelecionados.filter((id) => id !== idDisciplina)
        : [...estadoAnterior.preRequisitosSelecionados, idDisciplina];
      return { preRequisitosSelecionados: novaLista };
    });
  }

  async handleSubmitDisciplina(event) {
    event.preventDefault();
    const { nomeDisciplina, creditosDisciplina, preRequisitosSelecionados } = this.state;

    if (!nomeDisciplina.trim()) {
      this.props.aoNotificar('Informe o nome da disciplina.', true);
      return;
    }

    try {
      const novaDisc = await cadastrarDisciplina({
        nome: nomeDisciplina,
        creditos: Number(creditosDisciplina),
        preRequisitosIds: preRequisitosSelecionados,
      });
      this.setState({
        nomeDisciplina: '',
        creditosDisciplina: 4,
        preRequisitosSelecionados: [],
      });
      this.props.aoNotificar(`Disciplina "${novaDisc.nome}" cadastrada com sucesso!`, false);
      this.props.aoCadastrar();
    } catch (err) {
      this.props.aoNotificar(err.message, true);
    }
  }

  handleNomeProfessorChange(event) {
    this.setState({ nomeProfessor: event.target.value });
  }

  alternarDisciplinaProfessor(idDisciplina) {
    this.setState((estadoAnterior) => {
      const jaSelecionada = estadoAnterior.disciplinasSelecionadas.includes(idDisciplina);
      const novaLista = jaSelecionada
        ? estadoAnterior.disciplinasSelecionadas.filter((id) => id !== idDisciplina)
        : [...estadoAnterior.disciplinasSelecionadas, idDisciplina];
      return { disciplinasSelecionadas: novaLista };
    });
  }

  async handleSubmitProfessor(event) {
    event.preventDefault();
    const { nomeProfessor, disciplinasSelecionadas } = this.state;

    if (!nomeProfessor.trim() || disciplinasSelecionadas.length === 0) {
      this.props.aoNotificar(
        'Informe o nome do professor e selecione as disciplinas em que ele atua.',
        true,
      );
      return;
    }

    try {
      const novoProf = await cadastrarProfessor({
        nome: nomeProfessor,
        disciplinasIds: disciplinasSelecionadas,
      });
      this.setState({
        nomeProfessor: '',
        disciplinasSelecionadas: [],
      });
      this.props.aoNotificar(`Professor ${novoProf.nome} cadastrado com sucesso!`, false);
      this.props.aoCadastrar();
    } catch (err) {
      this.props.aoNotificar(err.message, true);
    }
  }

  handleDisciplinaTurmaChange(event) {
    this.setState({
      disciplinaId: event.target.value,
      professorId: '',
    });
  }

  handleProfessorChange(event) {
    this.setState({ professorId: event.target.value });
  }

  handleTurnoChange(event) {
    this.setState({ turno: event.target.value });
  }

  handleDiaSemanaChange(event) {
    this.setState({ diaSemana: event.target.value });
  }

  handleDataFimChange(event) {
    this.setState({ dataFim: event.target.value });
  }

  handleVagasChange(event) {
    this.setState({ vagas: event.target.value });
  }

  async handleSubmitTurma(event) {
    event.preventDefault();
    const { disciplinaId, professorId, turno, diaSemana, dataFim, vagas } = this.state;

    if (!disciplinaId || !professorId) {
      this.props.aoNotificar('Selecione a disciplina e o professor responsável.', true);
      return;
    }

    try {
      await cadastrarTurma({
        disciplinaId: Number(disciplinaId),
        professorId: Number(professorId),
        turno,
        diaSemana,
        dataFim,
        vagas,
      });
      this.setState({
        disciplinaId: '',
        professorId: '',
        dataFim: obterDataFimPadraoSemestre(),
        vagas: 30,
      });
      this.props.aoNotificar('Turma cadastrada com sucesso!', false);
      this.props.aoCadastrar();
    } catch (err) {
      this.props.aoNotificar(err.message, true);
    }
  }

  async alterarDataFimTurma(turmaId, novaData) {
    if (!novaData) return;
    try {
      await atualizarDataFimTurma(turmaId, novaData);
      this.props.aoNotificar('Data final da turma atualizada e ciclo processado!', false);
      this.props.aoCadastrar();
    } catch (err) {
      this.props.aoNotificar(err.message, true);
    }
  }

  selecionarTurma(turmaId) {
    this.setState((estadoAnterior) => ({
      turmaSelecionadaId: estadoAnterior.turmaSelecionadaId === turmaId ? null : turmaId,
    }));
  }

  async removerAlunoDaTurma(idMatricula, nomeAluno) {
    try {
      await cancelarMatricula(idMatricula);
      this.props.aoNotificar(`Matrícula de ${nomeAluno} removida da turma.`, false);
      this.props.aoCadastrar();
    } catch (err) {
      this.props.aoNotificar(err.message, true);
    }
  }

  render() {
    const { disciplinas, professores, turmas, matriculas } = this.props;
    const {
      nomeDisciplina,
      creditosDisciplina,
      preRequisitosSelecionados,
      nomeProfessor,
      disciplinasSelecionadas,
      disciplinaId,
      professorId,
      turno,
      diaSemana,
      dataFim,
      vagas,
      turmaSelecionadaId,
    } = this.state;

    const professoresDaDisciplina = disciplinaId
      ? professores.filter((p) => (p.disciplinasIds || []).includes(Number(disciplinaId)))
      : [];
    const turmaSelecionada = turmas.find((t) => t.id === turmaSelecionadaId) || null;
    const matriculasDaTurmaSelecionada = turmaSelecionada
      ? matriculas.filter((m) => m.turmaId === turmaSelecionada.id)
      : [];

    return (
      <div className="d-flex flex-column gap-4">
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body p-4">
                <h2 className="h5 fw-bold mb-3 text-dark">Cadastro de Disciplinas</h2>

                <form onSubmit={this.handleSubmitDisciplina} className="mb-3">
                  <div className="row g-2 mb-3">
                    <div className="col-8">
                      <label className="form-label small fw-medium">Nome da Disciplina</label>
                      <input
                        type="text"
                        value={nomeDisciplina}
                        onChange={this.handleNomeDisciplinaChange}
                        placeholder="Ex: Desenvolvimento Web"
                        className="form-control"
                      />
                    </div>

                    <div className="col-4">
                      <label className="form-label small fw-medium">Créditos</label>
                      <select
                        value={creditosDisciplina}
                        onChange={this.handleCreditosDisciplinaChange}
                        className="form-select"
                      >
                        <option value={2}>2 créditos</option>
                        <option value={4}>4 créditos</option>
                        <option value={6}>6 créditos</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-medium d-block">
                      Pré-requisitos (opcional)
                    </label>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          this.alternarPreRequisito(Number(e.target.value));
                        }
                      }}
                      className="form-select"
                    >
                      <option value="">Selecionar pré-requisito para adicionar...</option>
                      {disciplinas
                        .filter((d) => !preRequisitosSelecionados.includes(d.id))
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nome}
                          </option>
                        ))}
                    </select>

                    {preRequisitosSelecionados.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {preRequisitosSelecionados.map((id) => {
                          const disc = disciplinas.find((d) => d.id === id);
                          if (!disc) return null;
                          return (
                            <span
                              key={id}
                              className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1 px-2 py-1 fw-medium"
                            >
                              {disc.nome}
                              <button
                                type="button"
                                onClick={() => this.alternarPreRequisito(id)}
                                className="btn btn-sm p-0 border-0 text-primary lh-1 ms-1"
                                title="Remover pré-requisito"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-outline-primary btn-sm w-100 fw-medium">
                    Cadastrar Disciplina
                  </button>
                </form>

                <div className="pt-2 border-top">
                  <span className="small fw-semibold text-secondary d-block mb-2">
                    Disciplinas Cadastradas
                  </span>
                  <div
                    className="list-group list-group-flush border rounded overflow-auto"
                    style={{ maxHeight: '165px' }}
                  >
                    {disciplinas.map((d) => {
                      const nomesPreReq = (d.preRequisitosIds || [])
                        .map((id) => disciplinas.find((item) => item.id === id)?.nome)
                        .filter(Boolean)
                        .join(', ');

                      return (
                        <div
                          key={d.id}
                          className="list-group-item py-2 px-3 small d-flex justify-content-between align-items-start gap-2"
                        >
                          <div>
                            <strong className="text-dark">{d.nome}</strong>
                            {nomesPreReq && (
                              <span className="d-block text-secondary">Pré-req: {nomesPreReq}</span>
                            )}
                          </div>
                          <span className="badge bg-light text-dark border fw-medium">
                            {d.creditos || 4} cr
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body p-4">
                <h2 className="h5 fw-bold mb-3 text-dark">Cadastro de Professores</h2>

                <form onSubmit={this.handleSubmitProfessor} className="mb-3">
                  <div className="mb-3">
                    <label className="form-label small fw-medium">Nome do Professor</label>
                    <input
                      type="text"
                      value={nomeProfessor}
                      onChange={this.handleNomeProfessorChange}
                      placeholder="Ex: Maria Fernanda"
                      className="form-control"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-medium d-block">
                      Disciplinas em que atua
                    </label>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          this.alternarDisciplinaProfessor(Number(e.target.value));
                        }
                      }}
                      className="form-select"
                    >
                      <option value="">Selecionar disciplina para adicionar...</option>
                      {disciplinas
                        .filter((d) => !disciplinasSelecionadas.includes(d.id))
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nome}
                          </option>
                        ))}
                    </select>

                    {disciplinasSelecionadas.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {disciplinasSelecionadas.map((id) => {
                          const disc = disciplinas.find((d) => d.id === id);
                          if (!disc) return null;
                          return (
                            <span
                              key={id}
                              className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1 px-2 py-1 fw-medium"
                            >
                              {disc.nome}
                              <button
                                type="button"
                                onClick={() => this.alternarDisciplinaProfessor(id)}
                                className="btn btn-sm p-0 border-0 text-primary lh-1 ms-1"
                                title="Remover disciplina"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-outline-primary btn-sm w-100 fw-medium">
                    Cadastrar Professor
                  </button>
                </form>

                <div className="pt-2 border-top">
                  <span className="small fw-semibold text-secondary d-block mb-2">
                    Professores Cadastrados
                  </span>
                  <div
                    className="list-group list-group-flush border rounded overflow-auto"
                    style={{ maxHeight: '165px' }}
                  >
                    {professores.map((p) => {
                      const nomesDisciplinas = (p.disciplinasIds || [])
                        .map((id) => disciplinas.find((d) => d.id === id)?.nome)
                        .filter(Boolean)
                        .join(', ');
                      const qtdTurmas = turmas.filter((t) => Number(t.professorId) === p.id).length;

                      return (
                        <div
                          key={p.id}
                          className="list-group-item py-2 px-3 small d-flex justify-content-between align-items-start gap-2"
                        >
                          <div>
                            <strong className="text-dark">{p.nome}</strong>
                            <span className="d-block text-secondary">{nomesDisciplinas}</span>
                          </div>
                          <span className="badge bg-light text-dark border fw-medium">
                            {qtdTurmas}/{LIMITE_TURMAS_PROFESSOR} turmas
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h2 className="h5 fw-bold mb-3 text-dark">Ofertar Nova Turma</h2>

            <form onSubmit={this.handleSubmitTurma} className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-medium">Disciplina</label>
                <select
                  value={disciplinaId}
                  onChange={this.handleDisciplinaTurmaChange}
                  className="form-select"
                >
                  <option value="">Selecione uma disciplina...</option>
                  {disciplinas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome} ({d.creditos || 4} créditos)
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-medium">Professor Responsável</label>
                <select
                  value={professorId}
                  onChange={this.handleProfessorChange}
                  disabled={!disciplinaId}
                  className="form-select"
                >
                  <option value="">
                    {!disciplinaId
                      ? 'Selecione a disciplina primeiro...'
                      : professoresDaDisciplina.length === 0
                        ? 'Nenhum professor vinculado a esta disciplina'
                        : 'Selecione um professor...'}
                  </option>
                  {professoresDaDisciplina.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-medium">Turno</label>
                <select value={turno} onChange={this.handleTurnoChange} className="form-select">
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-medium">Dia da Semana</label>
                <select
                  value={diaSemana}
                  onChange={this.handleDiaSemanaChange}
                  className="form-select"
                >
                  <option value="Segunda-feira">Segunda-feira</option>
                  <option value="Terça-feira">Terça-feira</option>
                  <option value="Quarta-feira">Quarta-feira</option>
                  <option value="Quinta-feira">Quinta-feira</option>
                  <option value="Sexta-feira">Sexta-feira</option>
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-medium">Data Final da Turma</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={this.handleDataFimChange}
                  className="form-control"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-medium">Total de Vagas</label>
                <input
                  type="number"
                  min="1"
                  value={vagas}
                  onChange={this.handleVagasChange}
                  className="form-control"
                />
              </div>

              <div className="col-12 col-md-6 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100 fw-medium">
                  Cadastrar Turma
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h3 className="h6 fw-bold mb-3 text-dark">Turmas Ofertadas</h3>
            <div
              className="table-responsive border rounded overflow-auto"
              style={{ maxHeight: '260px' }}
            >
              <table className="table table-hover align-middle mb-0 small">
                <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th>Cód. Turma</th>
                    <th>Disciplina</th>
                    <th>Professor</th>
                    <th>Data Final</th>
                    <th>Ocupação</th>
                    <th className="text-end">Visualizar</th>
                  </tr>
                </thead>
                <tbody>
                  {turmas.map((t) => {
                    const selecionada = turmaSelecionadaId === t.id;

                    return (
                      <tr key={t.id} className={selecionada ? 'table-primary' : ''}>
                        <td>
                          <span className="codigo-horario me-2">{t.codigoTurma}</span>
                          <span className="text-secondary">
                            {t.diaSemana}, {t.turno}
                          </span>
                        </td>
                        <td>
                          <span className="fw-medium">{t.disciplina}</span>{' '}
                          <span className="text-secondary">({t.creditos || 4} cr)</span>
                        </td>
                        <td>{t.professor}</td>
                        <td>
                          <input
                            type="date"
                            value={t.dataFim || obterDataFimPadraoSemestre()}
                            onChange={(e) => this.alterarDataFimTurma(t.id, e.target.value)}
                            className="form-control form-control-sm w-auto"
                          />
                        </td>
                        <td>
                          {t.matriculados} / {t.vagas} vagas
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            onClick={() => this.selecionarTurma(t.id)}
                            className={`btn btn-sm py-1 px-2 fw-medium ${
                              selecionada ? 'btn-primary' : 'btn-outline-primary'
                            }`}
                          >
                            {selecionada ? 'Ocultar Detalhes' : 'Ver Turma e Alunos'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {turmaSelecionada && (
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 pb-3 border-bottom">
                <div>
                  <span className="codigo-horario me-2">{turmaSelecionada.codigoTurma}</span>
                  <span className="h5 fw-bold text-dark mb-0 align-middle">
                    {turmaSelecionada.disciplina}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span
                    className={`badge ${
                      turmaSelecionada.matriculados >= turmaSelecionada.vagas
                        ? 'bg-danger-subtle text-danger'
                        : 'bg-success-subtle text-success'
                    }`}
                  >
                    {turmaSelecionada.matriculados >= turmaSelecionada.vagas
                      ? 'Turma Lotada'
                      : 'Vagas Abertas'}
                  </span>
                  <button
                    type="button"
                    onClick={() => this.selecionarTurma(turmaSelecionada.id)}
                    className="btn btn-outline-secondary btn-sm py-0 px-2"
                  >
                    Fechar
                  </button>
                </div>
              </div>

              <div className="row g-3 mb-4 small">
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="p-3 bg-light rounded border h-100">
                    <span className="text-secondary d-block mb-1">Professor Responsável</span>
                    <strong className="text-dark">{turmaSelecionada.professor}</strong>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-md-3">
                  <div className="p-3 bg-light rounded border h-100">
                    <span className="text-secondary d-block mb-1">Dia e Turno</span>
                    <strong className="text-dark">
                      {turmaSelecionada.diaSemana} ({turmaSelecionada.turno})
                    </strong>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-md-3">
                  <div className="p-3 bg-light rounded border h-100">
                    <span className="text-secondary d-block mb-1">Créditos e Data Final</span>
                    <strong className="text-dark">
                      {turmaSelecionada.creditos || 4} cr • Término:{' '}
                      {formatarData(turmaSelecionada.dataFim)}
                    </strong>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-md-3">
                  <div className="p-3 bg-light rounded border h-100">
                    <span className="text-secondary d-block mb-1">Ocupação da Turma</span>
                    <strong className="text-dark">
                      {turmaSelecionada.matriculados} de {turmaSelecionada.vagas} vagas preenchidas
                    </strong>
                  </div>
                </div>
              </div>

              <h4 className="h6 fw-bold mb-3 text-dark">
                Alunos Matriculados na Turma ({matriculasDaTurmaSelecionada.length})
              </h4>

              {matriculasDaTurmaSelecionada.length === 0 ? (
                <div className="text-center py-3 bg-light rounded border small text-secondary">
                  Nenhum aluno matriculado nesta turma até o momento.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th>Matrícula</th>
                        <th>Nome do Aluno</th>
                        <th>E-mail</th>
                        <th>Situação</th>
                        <th className="text-end">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matriculasDaTurmaSelecionada.map((m) => (
                        <tr key={m.id}>
                          <td>
                            <span className="codigo-horario">
                              {m.matriculaAluno || m.usuarioId}
                            </span>
                          </td>
                          <td className="fw-medium">{m.aluno}</td>
                          <td className="text-secondary">{m.emailAluno || '—'}</td>
                          <td>
                            <span className="badge bg-success-subtle text-success">
                              Matriculado
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              onClick={() => this.removerAlunoDaTurma(m.id, m.aluno)}
                              className="btn btn-outline-danger btn-sm py-0 px-2"
                            >
                              Remover da Turma
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default CadastroTurma;
