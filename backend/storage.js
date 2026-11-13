import fs from 'fs';

const ARQUIVO_DADOS = './dados.json';

export const LIMITE_CREDITOS_SEMESTRE = 16;
export const LIMITE_TURMAS_PROFESSOR = 3;

export function salvarDados(dados) {
  fs.writeFileSync(ARQUIVO_DADOS, JSON.stringify(dados, null, 2));
}

export function processarCicloAutomatico(dados, dataReferencia) {
  const hoje = dataReferencia || new Date().toISOString().slice(0, 10);
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
    salvarDados(dados);
  }

  return dados;
}

export function lerDados() {
  const conteudo = fs.readFileSync(ARQUIVO_DADOS, 'utf-8');
  const dados = JSON.parse(conteudo);
  return processarCicloAutomatico(dados);
}

export function gerarCodigoTurma(diaSemana, turno, sequencial) {
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
