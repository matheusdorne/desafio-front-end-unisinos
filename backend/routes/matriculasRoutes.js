import { Router } from 'express';
import { buscarUsuarioPorId } from '../repositories/usuarioRepository.js';
import {
  buscarDisciplinaPorId,
  buscarDisciplinasPorIds,
  buscarTurmaPorId,
} from '../repositories/instituicaoRepository.js';
import {
  listarMatriculas,
  buscarMatriculaPorId,
  listarMatriculasPorUsuario,
  inserirMatricula,
  removerMatriculaPorId,
  LIMITE_CREDITOS_SEMESTRE,
} from '../repositories/matriculaRepository.js';

const router = Router();

router.get('/matriculas', (req, res) => {
  res.json(listarMatriculas());
});

router.post('/matriculas', (req, res) => {
  const { usuarioId, matriculaAluno, aluno, turmaId } = req.body;

  const turma = buscarTurmaPorId(turmaId);
  if (!turma) {
    return res.status(404).json({ erro: 'Turma não encontrada.' });
  }

  if (turma.matriculados >= turma.vagas) {
    return res.status(400).json({ erro: 'Esta turma já está com as vagas esgotadas.' });
  }

  const usuario = buscarUsuarioPorId(usuarioId);
  const concluidasIds = usuario?.disciplinasConcluidasIds || [];
  const matriculasAluno = listarMatriculasPorUsuario(usuarioId);

  if (concluidasIds.includes(Number(turma.disciplinaId))) {
    return res
      .status(400)
      .json({ erro: 'Você já concluiu esta disciplina em um semestre anterior.' });
  }

  // Unicidade garantida pelo usuarioId e disciplinaId
  const jaMatriculado = matriculasAluno.some(
    (m) => m.turmaId === turma.id || (turma.disciplinaId && m.disciplinaId === turma.disciplinaId),
  );
  if (jaMatriculado) {
    return res.status(400).json({ erro: 'Você já está matriculado nesta disciplina.' });
  }

  // Validação de pré-requisitos: exige conclusão em semestre anterior (não pode cursar no mesmo semestre)
  const disc = buscarDisciplinaPorId(turma.disciplinaId);
  const listaPreReq =
    turma.preRequisitosIds && turma.preRequisitosIds.length > 0
      ? turma.preRequisitosIds
      : disc?.preRequisitosIds || [];
  const naoConcluidos = listaPreReq.filter((idPreReq) => !concluidasIds.includes(Number(idPreReq)));
  if (naoConcluidos.length > 0) {
    const cursandoNesteSemestre = naoConcluidos.filter((idPreReq) =>
      matriculasAluno.some((m) => Number(m.disciplinaId) === Number(idPreReq)),
    );

    if (cursandoNesteSemestre.length > 0) {
      const nomesCursando = buscarDisciplinasPorIds(cursandoNesteSemestre)
        .map((d) => d.nome)
        .join(', ');
      return res.status(400).json({
        erro: `Não é permitido cursar "${turma.disciplina}" no mesmo semestre de seu pré-requisito ("${nomesCursando}"). Aguarde a data final da disciplina de pré-requisito.`,
      });
    }

    const nomesPendentes = buscarDisciplinasPorIds(naoConcluidos)
      .map((d) => d.nome)
      .join(', ');
    return res.status(400).json({
      erro: `Pré-requisito pendente: é necessário ter concluído "${nomesPendentes}" em semestre anterior para cursar "${turma.disciplina}".`,
    });
  }

  // Validação do limite de créditos por semestre
  const creditosAtuais = matriculasAluno.reduce((acc, m) => acc + (Number(m.creditos) || 4), 0);
  const creditosTurma = Number(turma.creditos) || 4;
  if (creditosAtuais + creditosTurma > LIMITE_CREDITOS_SEMESTRE) {
    return res.status(400).json({
      erro: `Limite de créditos excedido: você possui ${creditosAtuais} créditos e o máximo por semestre é ${LIMITE_CREDITOS_SEMESTRE}.`,
    });
  }

  const choqueHorario = matriculasAluno.find(
    (m) => m.diaSemana === turma.diaSemana && m.turno === turma.turno,
  );
  if (choqueHorario) {
    return res.status(400).json({
      erro: `Choque de horário: você já cursa "${choqueHorario.disciplina}" (Turma ${choqueHorario.codigoTurma}) na ${turma.diaSemana} (${turma.turno}).`,
    });
  }

  const novaMatricula = inserirMatricula({
    usuarioId,
    matriculaAluno,
    aluno,
    emailAluno: usuario?.email || '',
    turma,
  });

  res.status(201).json(novaMatricula);
});

router.delete('/matriculas/:id', (req, res) => {
  const idMatricula = Number(req.params.id);
  const matriculaExistente = buscarMatriculaPorId(idMatricula);

  if (!matriculaExistente) {
    return res.status(404).json({ erro: 'Matrícula não encontrada.' });
  }

  removerMatriculaPorId(idMatricula);
  res.json({ mensagem: 'Matrícula cancelada com sucesso.' });
});

export default router;
