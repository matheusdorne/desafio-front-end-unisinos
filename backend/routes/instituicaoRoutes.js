import { Router } from 'express';
import {
  lerDados,
  salvarDados,
  processarCicloAutomatico,
  gerarCodigoTurma,
  LIMITE_TURMAS_PROFESSOR,
} from '../storage.js';

const router = Router();

router.get('/disciplinas', (req, res) => {
  res.json(lerDados().disciplinas);
});

router.post('/disciplinas', (req, res) => {
  const dados = lerDados();
  const { nome, creditos, preRequisitosIds } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ erro: 'Informe o nome da disciplina.' });
  }
  const novaDisciplina = {
    id: Date.now(),
    nome: nome.trim(),
    creditos: Number(creditos) || 4,
    preRequisitosIds: Array.isArray(preRequisitosIds) ? preRequisitosIds.map(Number) : [],
  };
  dados.disciplinas.push(novaDisciplina);
  salvarDados(dados);
  res.status(201).json(novaDisciplina);
});

router.get('/professores', (req, res) => {
  res.json(lerDados().professores);
});

router.post('/professores', (req, res) => {
  const dados = lerDados();
  const { nome, disciplinasIds } = req.body;
  if (!nome || !Array.isArray(disciplinasIds) || disciplinasIds.length === 0) {
    return res
      .status(400)
      .json({ erro: 'Informe o nome do professor e selecione ao menos uma disciplina.' });
  }
  const novoProfessor = {
    id: Date.now(),
    nome: nome.trim(),
    disciplinasIds: disciplinasIds.map(Number),
  };
  dados.professores.push(novoProfessor);
  salvarDados(dados);
  res.status(201).json(novoProfessor);
});

router.get('/turmas', (req, res) => {
  res.json(lerDados().turmas);
});

router.post('/turmas', (req, res) => {
  const dados = lerDados();
  const { disciplinaId, professorId, turno, diaSemana, vagas, dataFim } = req.body;
  const disc = dados.disciplinas.find((d) => d.id === Number(disciplinaId));
  const prof = dados.professores.find((p) => p.id === Number(professorId));

  if (!disc || !prof) {
    return res.status(404).json({ erro: 'Selecione disciplina e professor válidos.' });
  }
  if (!prof.disciplinasIds.includes(disc.id)) {
    return res.status(400).json({
      erro: `O professor ${prof.nome} não atua na disciplina ${disc.nome}.`,
    });
  }

  const turmasDoProfessor = dados.turmas.filter((t) => Number(t.professorId) === prof.id);
  if (turmasDoProfessor.length >= LIMITE_TURMAS_PROFESSOR) {
    return res.status(400).json({
      erro: `Carga horária atingida: o professor ${prof.nome} já possui o limite de ${LIMITE_TURMAS_PROFESSOR} turmas alocadas no semestre.`,
    });
  }

  const conflitoProfessor = dados.turmas.some(
    (t) => Number(t.professorId) === prof.id && t.diaSemana === diaSemana && t.turno === turno,
  );
  if (conflitoProfessor) {
    return res.status(400).json({
      erro: `O professor ${prof.nome} já está alocado em uma turma na ${diaSemana} (${turno}).`,
    });
  }

  const novaTurma = {
    id: Date.now(),
    codigoTurma: gerarCodigoTurma(diaSemana, turno, dados.turmas.length + 1),
    disciplinaId: disc.id,
    disciplina: disc.nome,
    creditos: disc.creditos || 4,
    preRequisitosIds: disc.preRequisitosIds || [],
    professorId: prof.id,
    professor: prof.nome,
    turno,
    diaSemana,
    dataFim: dataFim || '2026-12-15',
    vagas: Number(vagas),
    matriculados: 0,
  };

  dados.turmas.push(novaTurma);
  salvarDados(dados);
  res.status(201).json(novaTurma);
});

router.post('/turmas/:id/data-fim', (req, res) => {
  const dados = lerDados();
  const idTurma = Number(req.params.id);
  const { dataFim } = req.body;
  const turma = dados.turmas.find((t) => t.id === idTurma);
  if (!turma) {
    return res.status(404).json({ erro: 'Turma não encontrada.' });
  }
  turma.dataFim = dataFim;
  dados.matriculas.forEach((m) => {
    if (m.turmaId === idTurma) m.dataFim = dataFim;
  });
  salvarDados(dados);
  processarCicloAutomatico(dados);
  res.json(turma);
});

export default router;
