import {
  lerBanco,
  salvarBanco,
  gerarProximoId,
  obterDataFimPadraoSemestre,
} from '../database/db.js';

export const LIMITE_CREDITOS_SEMESTRE = 16;

export function listarMatriculas() {
  return lerBanco().matriculas;
}

export function buscarMatriculaPorId(id) {
  const dados = lerBanco();
  return dados.matriculas.find((m) => m.id === Number(id)) || null;
}

export function listarMatriculasPorUsuario(usuarioId) {
  const dados = lerBanco();
  return dados.matriculas.filter((m) => m.usuarioId === Number(usuarioId));
}

export function inserirMatricula({ usuarioId, matriculaAluno, aluno, emailAluno, turma }) {
  const dados = lerBanco();
  const turmaBanco = dados.turmas.find((t) => t.id === Number(turma.id));
  if (turmaBanco) {
    turmaBanco.matriculados += 1;
  }

  const novaMatricula = {
    id: gerarProximoId(dados.matriculas),
    usuarioId: Number(usuarioId),
    matriculaAluno,
    aluno,
    emailAluno: emailAluno || '',
    turmaId: turma.id,
    codigoTurma: turma.codigoTurma,
    disciplinaId: turma.disciplinaId,
    disciplina: turma.disciplina,
    creditos: Number(turma.creditos) || 4,
    professor: turma.professor,
    turno: turma.turno,
    diaSemana: turma.diaSemana,
    dataFim: turma.dataFim || obterDataFimPadraoSemestre(),
  };

  dados.matriculas.push(novaMatricula);
  salvarBanco(dados);
  return novaMatricula;
}

export function removerMatriculaPorId(id) {
  const dados = lerBanco();
  const idNumerico = Number(id);
  const matricula = dados.matriculas.find((m) => m.id === idNumerico);
  if (!matricula) return false;

  const turma = dados.turmas.find((t) => t.id === matricula.turmaId);
  if (turma && turma.matriculados > 0) {
    turma.matriculados -= 1;
  }

  dados.matriculas = dados.matriculas.filter((m) => m.id !== idNumerico);
  salvarBanco(dados);
  return true;
}
