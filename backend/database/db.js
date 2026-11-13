import fs from 'fs';
import { DADOS_INICIAIS } from './seed.js';

const ARQUIVO_DADOS = './dados.json';

export function obterDataFimPadraoSemestre(dataReferencia = new Date()) {
  const ano = dataReferencia.getFullYear();
  const mes = dataReferencia.getMonth();
  return mes < 6 ? `${ano}-07-15` : `${ano}-12-15`;
}

export function gerarProximoId(lista = []) {
  if (!Array.isArray(lista) || lista.length === 0) return 1;
  const maiorId = Math.max(...lista.map((item) => Number(item.id) || 0));
  return maiorId + 1;
}

export function salvarBanco(dados) {
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
    salvarBanco(dados);
  }

  return dados;
}

export function lerBanco() {
  if (!fs.existsSync(ARQUIVO_DADOS)) {
    salvarBanco(DADOS_INICIAIS);
  }
  const conteudo = fs.readFileSync(ARQUIVO_DADOS, 'utf-8');
  const dados = JSON.parse(conteudo);
  return processarCicloAutomatico(dados);
}
