import express from 'express';
import cors from 'cors';
import fs from 'fs';

export const app = express();
const PORT = 3001;
const ARQUIVO_DADOS = './dados.json';

app.use(cors());
app.use(express.json());

function lerDados() {
  return JSON.parse(fs.readFileSync(ARQUIVO_DADOS, 'utf-8'));
}

function salvarDados(dados) {
  fs.writeFileSync(ARQUIVO_DADOS, JSON.stringify(dados, null, 2));
}

app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const dados = lerDados();
  const usuario = dados.usuarios.find(
    (u) => u.email.toLowerCase() === String(email || '').toLowerCase() && u.senha === senha,
  );
  if (!usuario) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }
  res.json(usuario);
});

app.get('/disciplinas', (req, res) => {
  res.json(lerDados().disciplinas);
});

app.get('/professores', (req, res) => {
  res.json(lerDados().professores);
});

app.get('/turmas', (req, res) => {
  res.json(lerDados().turmas);
});

app.post('/turmas', (req, res) => {
  const dados = lerDados();
  const { disciplinaId, professorId, turno, diaSemana, vagas } = req.body;
  const disc = dados.disciplinas.find((d) => d.id === Number(disciplinaId));
  const prof = dados.professores.find((p) => p.id === Number(professorId));

  if (!disc || !prof) {
    return res.status(404).json({ erro: 'Disciplina ou professor inválido.' });
  }

  const novaTurma = {
    id: Date.now(),
    codigoTurma: `330${dados.turmas.length + 1}`,
    disciplinaId: disc.id,
    disciplina: disc.nome,
    creditos: disc.creditos || 4,
    preRequisitosIds: disc.preRequisitosIds || [],
    professorId: prof.id,
    professor: prof.nome,
    turno,
    diaSemana,
    dataFim: '2026-12-15',
    vagas: Number(vagas),
    matriculados: 0,
  };

  dados.turmas.push(novaTurma);
  salvarDados(dados);
  res.status(201).json(novaTurma);
});

app.get('/matriculas', (req, res) => {
  res.json(lerDados().matriculas);
});

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}
