import dadosIniciaisBanco from '../../../backend/dados.json';

const CHAVE_STORAGE = 'portal_matriculas_dados_v7';
const LIMITE_CREDITOS_SEMESTRE = 16;
const LIMITE_TURMAS_PROFESSOR = 3;

function obterDataFimPadrao(dataReferencia = new Date()) {
  const ano = dataReferencia.getFullYear();
  const mes = dataReferencia.getMonth();
  return mes < 6 ? `${ano}-07-15` : `${ano}-12-15`;
}

function gerarProximoId(lista = []) {
  if (!Array.isArray(lista) || lista.length === 0) return 1;
  const maiorId = Math.max(...lista.map((item) => Number(item.id) || 0));
  return maiorId + 1;
}

function gerarMatriculaAluno(usuarios = [], dataReferencia = new Date()) {
  const anoAtual = String(dataReferencia.getFullYear());
  const sequenciaisAno = usuarios
    .map((u) => String(u.matricula || ''))
    .filter((mat) => mat.startsWith(anoAtual))
    .map((mat) => Number(mat.slice(anoAtual.length)) || 0);

  const proximoSequencial =
    sequenciaisAno.length > 0 ? Math.max(...sequenciaisAno) + 1 : usuarios.length + 1;

  return `${anoAtual}${String(proximoSequencial).padStart(3, '0')}`;
}

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

function salvarBancoLocal(dados) {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dados));
}

function processarCicloLocal(dados) {
  const hoje = new Date().toISOString().slice(0, 10);
  let houveAlteracao = false;
  const matriculasAtivas = [];

  for (const m of dados.matriculas || []) {
    const turma = (dados.turmas || []).find((t) => t.id === m.turmaId);
    const dataFim = turma?.dataFim || m.dataFim;

    if (dataFim && dataFim <= hoje) {
      const usuario = (dados.usuarios || []).find((u) => u.id === m.usuarioId);
      if (usuario && m.disciplinaId) {
        const concluidas = new Set(usuario.disciplinasConcluidasIds || []);
        concluidas.add(Number(m.disciplinaId));
        usuario.disciplinasConcluidasIds = Array.from(concluidas);
      }
      if (turma && turma.matriculados > 0) {
        turma.matriculados -= 1;
      }
      houveAlteracao = true;
    } else {
      matriculasAtivas.push(m);
    }
  }

  if (houveAlteracao) {
    dados.matriculas = matriculasAtivas;
    salvarBancoLocal(dados);
  }

  return dados;
}

export function lerBancoLocal() {
  const salvo = localStorage.getItem(CHAVE_STORAGE);
  if (!salvo) {
    const copia = structuredClone(dadosIniciaisBanco);
    salvarBancoLocal(copia);
    return processarCicloLocal(copia);
  }
  const dados = JSON.parse(salvo);
  return processarCicloLocal(dados);
}

export function buscarUsuarioLocal(usuarioId) {
  const dados = lerBancoLocal();
  const usuario = dados.usuarios.find((u) => u.id === Number(usuarioId));
  if (!usuario) return null;
  return {
    id: usuario.id,
    matricula: usuario.matricula,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    disciplinasConcluidasIds: usuario.disciplinasConcluidasIds || [],
  };
}

export function fazerLoginLocal(email, senha) {
  const dados = lerBancoLocal();
  const usuario = dados.usuarios.find(
    (u) => u.email.toLowerCase() === String(email || '').toLowerCase() && u.senha === senha,
  );
  if (!usuario) throw new Error('E-mail ou senha inválidos.');
  return {
    id: usuario.id,
    matricula: usuario.matricula,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    disciplinasConcluidasIds: usuario.disciplinasConcluidasIds || [],
  };
}

export function registrarUsuarioLocal({ nome, email, senha }) {
  const dados = lerBancoLocal();
  if (dados.usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Este e-mail já está cadastrado.');
  }
  const novoUsuario = {
    id: gerarProximoId(dados.usuarios),
    matricula: gerarMatriculaAluno(dados.usuarios),
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    senha,
    perfil: 'aluno',
    disciplinasConcluidasIds: [],
  };
  dados.usuarios.push(novoUsuario);
  salvarBancoLocal(dados);
  return {
    id: novoUsuario.id,
    matricula: novoUsuario.matricula,
    nome: novoUsuario.nome,
    email: novoUsuario.email,
    perfil: novoUsuario.perfil,
    disciplinasConcluidasIds: novoUsuario.disciplinasConcluidasIds,
  };
}

export function alterarSenhaLocal({ usuarioId, senhaAtual, novaSenha }) {
  const dados = lerBancoLocal();
  const usuario = dados.usuarios.find((u) => u.id === Number(usuarioId));
  if (!usuario) throw new Error('Usuário não encontrado.');
  if (usuario.senha !== senhaAtual) {
    throw new Error('A senha atual informada está incorreta.');
  }
  usuario.senha = novaSenha;
  salvarBancoLocal(dados);
  return { mensagem: 'Senha alterada com sucesso!' };
}

export function cadastrarDisciplinaLocal({ nome, creditos, preRequisitosIds }) {
  const dados = lerBancoLocal();
  const nova = {
    id: gerarProximoId(dados.disciplinas),
    nome: nome.trim(),
    creditos: Number(creditos) || 4,
    preRequisitosIds: Array.isArray(preRequisitosIds) ? preRequisitosIds.map(Number) : [],
  };
  dados.disciplinas.push(nova);
  salvarBancoLocal(dados);
  return nova;
}

export function cadastrarProfessorLocal({ nome, disciplinasIds }) {
  const dados = lerBancoLocal();
  const novo = {
    id: gerarProximoId(dados.professores),
    nome: nome.trim(),
    disciplinasIds: disciplinasIds.map(Number),
  };
  dados.professores.push(novo);
  salvarBancoLocal(dados);
  return novo;
}

export function cadastrarTurmaLocal(novaTurma) {
  const dados = lerBancoLocal();
  const disc = dados.disciplinas.find((d) => d.id === Number(novaTurma.disciplinaId));
  const prof = dados.professores.find((p) => p.id === Number(novaTurma.professorId));

  if (!disc || !prof) throw new Error('Selecione disciplina e professor válidos.');
  if (!prof.disciplinasIds.includes(disc.id)) {
    throw new Error(`O professor ${prof.nome} não atua na disciplina ${disc.nome}.`);
  }

  const turmasDoProfessor = dados.turmas.filter((t) => Number(t.professorId) === prof.id);
  if (turmasDoProfessor.length >= LIMITE_TURMAS_PROFESSOR) {
    throw new Error(
      `Carga horária atingida: o professor ${prof.nome} já possui o limite de ${LIMITE_TURMAS_PROFESSOR} turmas alocadas no semestre.`,
    );
  }

  const conflito = dados.turmas.some(
    (t) =>
      Number(t.professorId) === prof.id &&
      t.diaSemana === novaTurma.diaSemana &&
      t.turno === novaTurma.turno,
  );
  if (conflito) {
    throw new Error(
      `O professor ${prof.nome} já está alocado em uma turma na ${novaTurma.diaSemana} (${novaTurma.turno}).`,
    );
  }

  const proximoIdTurma = gerarProximoId(dados.turmas);
  const registro = {
    id: proximoIdTurma,
    codigoTurma: gerarCodigoTurma(novaTurma.diaSemana, novaTurma.turno, proximoIdTurma),
    disciplinaId: disc.id,
    disciplina: disc.nome,
    creditos: disc.creditos || 4,
    preRequisitosIds: disc.preRequisitosIds || [],
    professorId: prof.id,
    professor: prof.nome,
    turno: novaTurma.turno,
    diaSemana: novaTurma.diaSemana,
    dataFim: novaTurma.dataFim || obterDataFimPadrao(),
    vagas: Number(novaTurma.vagas),
    matriculados: 0,
  };
  dados.turmas.push(registro);
  salvarBancoLocal(dados);
  return registro;
}

export function atualizarDataFimTurmaLocal(turmaId, dataFim) {
  const dados = lerBancoLocal();
  const turma = dados.turmas.find((t) => t.id === Number(turmaId));
  if (!turma) throw new Error('Turma não encontrada.');
  turma.dataFim = dataFim;
  dados.matriculas.forEach((m) => {
    if (m.turmaId === Number(turmaId)) {
      m.dataFim = dataFim;
    }
  });
  salvarBancoLocal(dados);
  processarCicloLocal(dados);
  return turma;
}

export function criarMatriculaLocal(usuario, turmaId) {
  const dados = lerBancoLocal();
  const turma = dados.turmas.find((t) => t.id === Number(turmaId));
  if (!turma) throw new Error('Turma não encontrada.');
  if (turma.matriculados >= turma.vagas) {
    throw new Error('Esta turma já está com as vagas esgotadas.');
  }

  const usuarioBanco = dados.usuarios.find((u) => u.id === usuario.id);
  const concluidasIds =
    usuarioBanco?.disciplinasConcluidasIds || usuario.disciplinasConcluidasIds || [];
  const matriculasAluno = dados.matriculas.filter((m) => m.usuarioId === usuario.id);

  if (concluidasIds.includes(Number(turma.disciplinaId))) {
    throw new Error('Você já concluiu esta disciplina em um semestre anterior.');
  }

  const jaMatriculado = matriculasAluno.some(
    (m) => m.turmaId === turma.id || (turma.disciplinaId && m.disciplinaId === turma.disciplinaId),
  );
  if (jaMatriculado) {
    throw new Error('Você já está matriculado nesta disciplina.');
  }

  const listaPreReq = turma.preRequisitosIds || [];
  const naoConcluidos = listaPreReq.filter((idPreReq) => !concluidasIds.includes(Number(idPreReq)));
  if (naoConcluidos.length > 0) {
    const cursandoNesteSemestre = naoConcluidos.filter((idPreReq) =>
      matriculasAluno.some((m) => Number(m.disciplinaId) === Number(idPreReq)),
    );

    if (cursandoNesteSemestre.length > 0) {
      const nomesCursando = cursandoNesteSemestre
        .map((id) => dados.disciplinas.find((d) => d.id === Number(id))?.nome)
        .filter(Boolean)
        .join(', ');
      throw new Error(
        `Não é permitido cursar "${turma.disciplina}" no mesmo semestre de seu pré-requisito ("${nomesCursando}"). Aguarde a data final da disciplina de pré-requisito.`,
      );
    }

    const nomesPendentes = naoConcluidos
      .map((id) => dados.disciplinas.find((d) => d.id === Number(id))?.nome)
      .filter(Boolean)
      .join(', ');
    throw new Error(
      `Pré-requisito pendente: é necessário ter concluído "${nomesPendentes}" em semestre anterior para cursar "${turma.disciplina}".`,
    );
  }

  const creditosAtuais = matriculasAluno.reduce((acc, m) => acc + (Number(m.creditos) || 4), 0);
  const creditosTurma = Number(turma.creditos) || 4;
  if (creditosAtuais + creditosTurma > LIMITE_CREDITOS_SEMESTRE) {
    throw new Error(
      `Limite de créditos excedido: você possui ${creditosAtuais} créditos e o máximo por semestre é ${LIMITE_CREDITOS_SEMESTRE}.`,
    );
  }

  const choque = matriculasAluno.find(
    (m) => m.diaSemana === turma.diaSemana && m.turno === turma.turno,
  );
  if (choque) {
    throw new Error(
      `Choque de horário: você já cursa "${choque.disciplina}" (Turma ${choque.codigoTurma}) na ${turma.diaSemana} (${turma.turno}).`,
    );
  }

  turma.matriculados += 1;
  const novaMatricula = {
    id: gerarProximoId(dados.matriculas),
    usuarioId: usuario.id,
    matriculaAluno: usuario.matricula,
    aluno: usuario.nome,
    emailAluno: usuario.email || '',
    turmaId: turma.id,
    codigoTurma: turma.codigoTurma,
    disciplinaId: turma.disciplinaId,
    disciplina: turma.disciplina,
    creditos: creditosTurma,
    professor: turma.professor,
    turno: turma.turno,
    diaSemana: turma.diaSemana,
    dataFim: turma.dataFim || obterDataFimPadrao(),
  };
  dados.matriculas.push(novaMatricula);
  salvarBancoLocal(dados);
  return novaMatricula;
}

export function cancelarMatriculaLocal(matriculaId) {
  const dados = lerBancoLocal();
  const matricula = dados.matriculas.find((m) => m.id === Number(matriculaId));
  if (matricula) {
    const turma = dados.turmas.find((t) => t.id === matricula.turmaId);
    if (turma && turma.matriculados > 0) turma.matriculados -= 1;
    dados.matriculas = dados.matriculas.filter((m) => m.id !== Number(matriculaId));
    salvarBancoLocal(dados);
  }
  return { mensagem: 'Matrícula cancelada com sucesso.' };
}
