import {
  lerBanco,
  salvarBanco,
  gerarProximoId,
  obterDataFimPadraoSemestre,
  processarCicloAutomatico,
} from '../database/db.js';

export const LIMITE_TURMAS_PROFESSOR = 3;

function gerarCodigoTurma(diaSemana, turno, sequencial) {
  const mapaDia = {
    'Segunda-feira': '2',
    'Terça-feira': '3',
    'Quarta-feira': '4',
    'Quinta-feira': '5',
    'Sexta-feira': '6',
  };
  const mapaTurno = { Manhã: '1', Tarde: '2', Noite: '3' };
  const prefixo = `${mapaDia[diaSemana] || '2'}${mapaTurno[turno] || '1'}`;
  return `${prefixo}${String(sequencial).padStart(2, '0')}`;
}

export function listarDisciplinas() {
  return lerBanco().disciplinas;
}

export function buscarDisciplinaPorId(id) {
  const dados = lerBanco();
  return dados.disciplinas.find((d) => d.id === Number(id)) || null;
}

export function buscarDisciplinasPorIds(ids = []) {
  const conjuntoIds = new Set(ids.map(Number));
  const dados = lerBanco();
  return dados.disciplinas.filter((d) => conjuntoIds.has(Number(d.id)));
}

export function inserirDisciplina({ nome, creditos, preRequisitosIds }) {
  const dados = lerBanco();
  const novaDisciplina = {
    id: gerarProximoId(dados.disciplinas),
    nome: nome.trim(),
    creditos: Number(creditos) || 4,
    preRequisitosIds: Array.isArray(preRequisitosIds) ? preRequisitosIds.map(Number) : [],
  };

  dados.disciplinas.push(novaDisciplina);
  salvarBanco(dados);
  return novaDisciplina;
}

export function listarProfessores() {
  return lerBanco().professores;
}

export function buscarProfessorPorId(id) {
  const dados = lerBanco();
  return dados.professores.find((p) => p.id === Number(id)) || null;
}

export function inserirProfessor({ nome, disciplinasIds }) {
  const dados = lerBanco();
  const novoProfessor = {
    id: gerarProximoId(dados.professores),
    nome: nome.trim(),
    disciplinasIds: disciplinasIds.map(Number),
  };

  dados.professores.push(novoProfessor);
  salvarBanco(dados);
  return novoProfessor;
}

export function listarTurmas() {
  return lerBanco().turmas;
}

export function buscarTurmaPorId(id) {
  const dados = lerBanco();
  return dados.turmas.find((t) => t.id === Number(id)) || null;
}

export function listarTurmasPorProfessor(professorId) {
  const dados = lerBanco();
  return dados.turmas.filter((t) => Number(t.professorId) === Number(professorId));
}

export function buscarTurmaConflitoProfessor(professorId, diaSemana, turno) {
  const dados = lerBanco();
  return (
    dados.turmas.find(
      (t) =>
        Number(t.professorId) === Number(professorId) &&
        t.diaSemana === diaSemana &&
        t.turno === turno,
    ) || null
  );
}

export function inserirTurma({ disciplina, professor, turno, diaSemana, vagas, dataFim }) {
  const dados = lerBanco();
  const proximoIdTurma = gerarProximoId(dados.turmas);
  const novaTurma = {
    id: proximoIdTurma,
    codigoTurma: gerarCodigoTurma(diaSemana, turno, proximoIdTurma),
    disciplinaId: disciplina.id,
    disciplina: disciplina.nome,
    creditos: disciplina.creditos || 4,
    preRequisitosIds: disciplina.preRequisitosIds || [],
    professorId: professor.id,
    professor: professor.nome,
    turno,
    diaSemana,
    dataFim: dataFim || obterDataFimPadraoSemestre(),
    vagas: Number(vagas),
    matriculados: 0,
  };

  dados.turmas.push(novaTurma);
  salvarBanco(dados);
  return novaTurma;
}

export function atualizarDataFimDaTurma(turmaId, dataFim) {
  const dados = lerBanco();
  const idNumerico = Number(turmaId);
  const turma = dados.turmas.find((t) => t.id === idNumerico);
  if (!turma) return null;

  turma.dataFim = dataFim;
  dados.matriculas.forEach((m) => {
    if (m.turmaId === idNumerico) {
      m.dataFim = dataFim;
    }
  });

  salvarBanco(dados);
  processarCicloAutomatico(dados);
  return turma;
}
