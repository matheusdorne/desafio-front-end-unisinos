import { Router } from 'express';
import { lerDados, salvarDados, LIMITE_CREDITOS_SEMESTRE } from '../storage.js';

const router = Router();

router.get('/matriculas', (req, res) => {
  res.json(lerDados().matriculas);
});

router.post('/matriculas', (req, res) => {
  const dados = lerDados();
  const { usuarioId, matriculaAluno, aluno, turmaId } = req.body;
  const turma = dados.turmas.find((t) => t.id === Number(turmaId));
  if (!turma) {
    return res.status(404).json({ erro: 'Turma não encontrada.' });
  }
  if (turma.matriculados >= turma.vagas) {
    return res.status(400).json({ erro: 'Esta turma já está com as vagas esgotadas.' });
  }

  const usuario = dados.usuarios.find((u) => u.id === Number(usuarioId));
  const concluidasIds = usuario?.disciplinasConcluidasIds || [];
  const matriculasAluno = dados.matriculas.filter((m) => m.usuarioId === Number(usuarioId));

  if (concluidasIds.includes(Number(turma.disciplinaId))) {
    return res
      .status(400)
      .json({ erro: 'Você já concluiu esta disciplina em um semestre anterior.' });
  }

  const creditosAtuais = matriculasAluno.reduce((acc, m) => acc + (Number(m.creditos) || 4), 0);
  const creditosTurma = Number(turma.creditos) || 4;
  if (creditosAtuais + creditosTurma > LIMITE_CREDITOS_SEMESTRE) {
    return res.status(400).json({
      erro: `Limite de créditos excedido: você possui ${creditosAtuais} créditos e o máximo por semestre é ${LIMITE_CREDITOS_SEMESTRE}.`,
    });
  }

  turma.matriculados += 1;
  const novaMatricula = {
    id: Date.now(),
    usuarioId: Number(usuarioId),
    matriculaAluno,
    aluno,
    emailAluno: usuario?.email || '',
    turmaId: turma.id,
    codigoTurma: turma.codigoTurma,
    disciplinaId: turma.disciplinaId,
    disciplina: turma.disciplina,
    creditos: creditosTurma,
    professor: turma.professor,
    turno: turma.turno,
    diaSemana: turma.diaSemana,
    dataFim: turma.dataFim || '2026-12-15',
  };

  dados.matriculas.push(novaMatricula);
  salvarDados(dados);
  res.status(201).json(novaMatricula);
});

router.delete('/matriculas/:id', (req, res) => {
  const dados = lerDados();
  const idMatricula = Number(req.params.id);
  const matricula = dados.matriculas.find((m) => m.id === idMatricula);
  if (!matricula) {
    return res.status(404).json({ erro: 'Matrícula não encontrada.' });
  }
  const turma = dados.turmas.find((t) => t.id === matricula.turmaId);
  if (turma && turma.matriculados > 0) turma.matriculados -= 1;
  dados.matriculas = dados.matriculas.filter((m) => m.id !== idMatricula);
  salvarDados(dados);
  res.json({ mensagem: 'Matrícula cancelada com sucesso.' });
});

export default router;
