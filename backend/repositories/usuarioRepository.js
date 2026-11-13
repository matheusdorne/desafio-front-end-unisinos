import { lerBanco, salvarBanco, gerarProximoId } from '../database/db.js';

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

export function sanitizarUsuario(usuario) {
  return {
    id: usuario.id,
    matricula: usuario.matricula,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    disciplinasConcluidasIds: usuario.disciplinasConcluidasIds || [],
  };
}

export function buscarUsuarioPorId(id) {
  const dados = lerBanco();
  return dados.usuarios.find((u) => u.id === Number(id)) || null;
}

export function buscarUsuarioPorEmail(email) {
  const emailNormalizado = String(email || '')
    .trim()
    .toLowerCase();
  const dados = lerBanco();
  return dados.usuarios.find((u) => u.email.toLowerCase() === emailNormalizado) || null;
}

export function criarUsuario({ nome, email, senha }) {
  const dados = lerBanco();
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
  salvarBanco(dados);
  return novoUsuario;
}

export function atualizarSenhaUsuario(id, novaSenha) {
  const dados = lerBanco();
  const usuario = dados.usuarios.find((u) => u.id === Number(id));
  if (!usuario) return null;

  usuario.senha = novaSenha;
  salvarBanco(dados);
  return usuario;
}
