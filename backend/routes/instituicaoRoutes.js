import { Router } from 'express';
import {
  listarDisciplinas,
  buscarDisciplinaPorId,
  inserirDisciplina,
  listarProfessores,
  buscarProfessorPorId,
  inserirProfessor,
  listarTurmas,
  buscarTurmaPorId,
  listarTurmasPorProfessor,
  buscarTurmaConflitoProfessor,
  inserirTurma,
  atualizarDataFimDaTurma,
  LIMITE_TURMAS_PROFESSOR,
} from '../repositories/instituicaoRepository.js';

const router = Router();

router.get('/disciplinas', (req, res) => {
  res.json(listarDisciplinas());
});

router.post('/disciplinas', (req, res) => {
  const { nome, creditos, preRequisitosIds } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ erro: 'Informe o nome da disciplina.' });
  }

  const novaDisciplina = inserirDisciplina({ nome, creditos, preRequisitosIds });
  res.status(201).json(novaDisciplina);
});

router.get('/professores', (req, res) => {
  res.json(listarProfessores());
});

router.post('/professores', (req, res) => {
  const { nome, disciplinasIds } = req.body;

  if (!nome || !Array.isArray(disciplinasIds) || disciplinasIds.length === 0) {
    return res
      .status(400)
      .json({ erro: 'Informe o nome do professor e selecione ao menos uma disciplina.' });
  }

  const novoProfessor = inserirProfessor({ nome, disciplinasIds });
  res.status(201).json(novoProfessor);
});

router.get('/turmas', (req, res) => {
  res.json(listarTurmas());
});

router.post('/turmas', (req, res) => {
  const { disciplinaId, professorId, turno, diaSemana, vagas, dataFim } = req.body;

  const disc = buscarDisciplinaPorId(disciplinaId);
  if (!disc) {
    return res.status(404).json({ erro: 'Selecione uma disciplina válida.' });
  }

  const prof = buscarProfessorPorId(professorId);
  if (!prof) {
    return res.status(404).json({ erro: 'Selecione um professor válido.' });
  }

  if (!prof.disciplinasIds.includes(disc.id)) {
    return res.status(400).json({
      erro: `O professor ${prof.nome} não atua na disciplina ${disc.nome}.`,
    });
  }

  const turmasDoProfessor = listarTurmasPorProfessor(prof.id);
  if (turmasDoProfessor.length >= LIMITE_TURMAS_PROFESSOR) {
    return res.status(400).json({
      erro: `Carga horária atingida: o professor ${prof.nome} já possui o limite de ${LIMITE_TURMAS_PROFESSOR} turmas alocadas no semestre.`,
    });
  }

  // Unicidade de horário do professor garantida pelo professorId
  const conflitoProfessor = buscarTurmaConflitoProfessor(prof.id, diaSemana, turno);
  if (conflitoProfessor) {
    return res.status(400).json({
      erro: `O professor ${prof.nome} já está alocado em uma turma na ${diaSemana} (${turno}).`,
    });
  }

  const novaTurma = inserirTurma({
    disciplina: disc,
    professor: prof,
    turno,
    diaSemana,
    vagas,
    dataFim,
  });

  res.status(201).json(novaTurma);
});

router.post('/turmas/:id/data-fim', (req, res) => {
  const idTurma = Number(req.params.id);
  const { dataFim } = req.body;

  const turmaExistente = buscarTurmaPorId(idTurma);
  if (!turmaExistente) {
    return res.status(404).json({ erro: 'Turma não encontrada.' });
  }

  if (!dataFim) {
    return res.status(400).json({ erro: 'Informe a data final da turma.' });
  }

  const turmaAtualizada = atualizarDataFimDaTurma(idTurma, dataFim);
  res.json(turmaAtualizada);
});

export default router;
