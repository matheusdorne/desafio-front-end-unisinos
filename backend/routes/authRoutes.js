import { Router } from 'express';
import {
  sanitizarUsuario,
  buscarUsuarioPorId,
  buscarUsuarioPorEmail,
  criarUsuario,
  atualizarSenhaUsuario,
} from '../repositories/usuarioRepository.js';

const router = Router();

router.get('/usuarios/:id', (req, res) => {
  const usuario = buscarUsuarioPorId(req.params.id);
  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }
  res.json(sanitizarUsuario(usuario));
});

router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const usuario = buscarUsuarioPorEmail(email);

  if (!usuario || usuario.senha !== senha) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }

  res.json(sanitizarUsuario(usuario));
});

router.post('/registro', (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha nome, e-mail e senha.' });
  }

  const usuarioExistente = buscarUsuarioPorEmail(email);
  if (usuarioExistente) {
    return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
  }

  const novoUsuario = criarUsuario({ nome, email, senha });
  res.status(201).json(sanitizarUsuario(novoUsuario));
});

router.post('/alterar-senha', (req, res) => {
  const { usuarioId, senhaAtual, novaSenha } = req.body;
  const usuario = buscarUsuarioPorId(usuarioId);

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  if (usuario.senha !== senhaAtual) {
    return res.status(400).json({ erro: 'A senha atual informada está incorreta.' });
  }

  if (!novaSenha || novaSenha.length < 6) {
    return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres.' });
  }

  atualizarSenhaUsuario(usuarioId, novaSenha);
  res.json({ mensagem: 'Senha alterada com sucesso!' });
});

export default router;
