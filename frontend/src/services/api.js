import {
  lerBancoLocal,
  buscarUsuarioLocal,
  fazerLoginLocal,
  registrarUsuarioLocal,
  alterarSenhaLocal,
  cadastrarDisciplinaLocal,
  cadastrarProfessorLocal,
  cadastrarTurmaLocal,
  atualizarDataFimTurmaLocal,
  criarMatriculaLocal,
  cancelarMatriculaLocal,
} from './contingenciaLocal';

const API_URL = 'http://localhost:3001';

export const LIMITE_CREDITOS_SEMESTRE = 16;
export const LIMITE_TURMAS_PROFESSOR = 3;

export function obterDataFimPadraoSemestre(dataReferencia = new Date()) {
  const ano = dataReferencia.getFullYear();
  const mes = dataReferencia.getMonth();
  return mes < 6 ? `${ano}-07-15` : `${ano}-12-15`;
}

export function formatarData(dataIso) {
  const valor = dataIso || obterDataFimPadraoSemestre();
  const partes = String(valor).split('-');
  if (partes.length !== 3) return valor;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export async function buscarUsuario(usuarioId) {
  try {
    const res = await fetch(`${API_URL}/usuarios/${usuarioId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    if (err instanceof TypeError) return buscarUsuarioLocal(usuarioId);
    return null;
  }
}

export async function fazerLogin(email, senha) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    const dados = await res.json();
    if (!res.ok) throw new Error(dados.erro || 'Credenciais inválidas.');
    return dados;
  } catch (err) {
    if (err instanceof TypeError) return fazerLoginLocal(email, senha);
    throw err;
  }
}

export async function registrarUsuario({ nome, email, senha }) {
  try {
    const res = await fetch(`${API_URL}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    });
    const dados = await res.json();
    if (!res.ok) throw new Error(dados.erro || 'Erro ao criar conta.');
    return dados;
  } catch (err) {
    if (err instanceof TypeError) return registrarUsuarioLocal({ nome, email, senha });
    throw err;
  }
}

export async function alterarSenha({ usuarioId, senhaAtual, novaSenha }) {
  try {
    const res = await fetch(`${API_URL}/alterar-senha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId, senhaAtual, novaSenha }),
    });
    const dados = await res.json();
    if (!res.ok) throw new Error(dados.erro || 'Erro ao alterar senha.');
    return dados;
  } catch (err) {
    if (err instanceof TypeError) return alterarSenhaLocal({ usuarioId, senhaAtual, novaSenha });
    throw err;
  }
}

export async function buscarDisciplinas() {
  try {
    const res = await fetch(`${API_URL}/disciplinas`);
    if (!res.ok) throw new Error('Erro ao carregar disciplinas.');
    return await res.json();
  } catch {
    return lerBancoLocal().disciplinas;
  }
}

export async function cadastrarDisciplina({ nome, creditos, preRequisitosIds }) {
  try {
    const res = await fetch(`${API_URL}/disciplinas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, creditos, preRequisitosIds }),
    });
    const dados = await res.json();
    if (!res.ok) throw new Error(dados.erro || 'Erro ao cadastrar disciplina.');
    return dados;
  } catch (err) {
    if (err instanceof TypeError) {
      return cadastrarDisciplinaLocal({ nome, creditos, preRequisitosIds });
    }
    throw err;
  }
}

export async function buscarProfessores() {
  try {
    const res = await fetch(`${API_URL}/professores`);
    if (!res.ok) throw new Error('Erro ao carregar professores.');
    return await res.json();
  } catch {
    return lerBancoLocal().professores;
  }
}

export async function cadastrarProfessor({ nome, disciplinasIds }) {
  try {
    const res = await fetch(`${API_URL}/professores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, disciplinasIds }),
    });
    const dados = await res.json();
    if (!res.ok) throw new Error(dados.erro || 'Erro ao cadastrar professor.');
    return dados;
  } catch (err) {
    if (err instanceof TypeError) return cadastrarProfessorLocal({ nome, disciplinasIds });
    throw err;
  }
}

export async function buscarTurmas() {
  try {
    const res = await fetch(`${API_URL}/turmas`);
    if (!res.ok) throw new Error('Erro ao carregar turmas.');
    return await res.json();
  } catch {
    return lerBancoLocal().turmas;
  }
}

export async function cadastrarTurma(novaTurma) {
  try {
    const res = await fetch(`${API_URL}/turmas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaTurma),
    });
    const dados = await res.json();
    if (!res.ok) throw new Error(dados.erro || 'Erro ao cadastrar turma.');
    return dados;
  } catch (err) {
    if (err instanceof TypeError) return cadastrarTurmaLocal(novaTurma);
    throw err;
  }
}

export async function atualizarDataFimTurma(turmaId, dataFim) {
  try {
    const res = await fetch(`${API_URL}/turmas/${turmaId}/data-fim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataFim }),
    });
    const dados = await res.json();
    if (!res.ok) throw new Error(dados.erro || 'Erro ao atualizar data final da turma.');
    return dados;
  } catch (err) {
    if (err instanceof TypeError) return atualizarDataFimTurmaLocal(turmaId, dataFim);
    throw err;
  }
}

export async function buscarMatriculas() {
  try {
    const res = await fetch(`${API_URL}/matriculas`);
    if (!res.ok) throw new Error('Erro ao carregar matrículas.');
    return await res.json();
  } catch {
    return lerBancoLocal().matriculas;
  }
}

export async function criarMatricula(usuario, turmaId) {
  try {
    const res = await fetch(`${API_URL}/matriculas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: usuario.id,
        matriculaAluno: usuario.matricula,
        aluno: usuario.nome,
        turmaId,
      }),
    });
    const dados = await res.json();
    if (!res.ok) throw new Error(dados.erro || 'Não foi possível realizar a matrícula.');
    return dados;
  } catch (err) {
    if (err instanceof TypeError) return criarMatriculaLocal(usuario, turmaId);
    throw err;
  }
}

export async function cancelarMatricula(matriculaId) {
  try {
    const res = await fetch(`${API_URL}/matriculas/${matriculaId}`, {
      method: 'DELETE',
    });
    const dados = await res.json();
    if (!res.ok) throw new Error(dados.erro || 'Erro ao cancelar matrícula.');
    return dados;
  } catch (err) {
    if (err instanceof TypeError) return cancelarMatriculaLocal(matriculaId);
    throw err;
  }
}
