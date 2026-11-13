import { Router } from 'express';
import { lerDados, salvarDados, sanitizarUsuario } from '../storage.js';

const router = Router();

router.get('/usuarios/:id', (req, res) => {
  const dados = lerDados();
  const usuario = dados.usuarios.find((u) => u.id === Number(req.params.id));
  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }
  res.json(sanitizarUsuario(usuario));
});

router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const dados = lerDados();
  const usuario = dados.usuarios.find(
    (u) => u.email.toLowerCase() === String(email || '').toLowerCase() && u.senha === senha,
  );
  if (!usuario) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }
  res.json(sanitizarUsuario(usuario));
});

router.post('/registro', (req, res) => {
  const { nome, email, senha } = req.body;
  const dados = lerDados();

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha nome, e-mail e senha.' });
  }

  const jaExiste = dados.usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (jaExiste) {
    return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
  }

  const novoUsuario = {
    id: Date.now(),
    matricula: `2026${String(dados.usuarios.length + 1).padStart(3, '0')}`,
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    senha,
    perfil: 'aluno',
    disciplinasConcluidasIds: [],
  };

  dados.usuarios.push(novoUsuario);
  salvarDados(dados);
  res.status(201).json(sanitizarUsuario(novoUsuario));
});

router.post('/alterar-senha', (req, res) => {
  const { usuarioId, senhaAtual, novaSenha } = req.body;
  const dados = lerDados();
  const usuario = dados.usuarios.find((u) => u.id === Number(usuarioId));

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }
  if (usuario.senha !== senhaAtual) {
    return res.status(400).json({ erro: 'A senha atual informada está incorreta.' });
  }
  if (!novaSenha || novaSenha.length < 6) {
    return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres.' });
  }

  usuario.senha = novaSenha;
  salvarDados(dados);
  res.json({ mensagem: 'Senha alterada com sucesso!' });
});

export default router;
