import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import { app } from './server.js';

let server;
let baseUrl;
let backup;

describe('Testes Unitários e de Regras de Negócio da API', () => {
  before(() => {
    backup = fs.readFileSync('./dados.json', 'utf-8');
    server = app.listen(0);
    baseUrl = `http://localhost:${server.address().port}`;
  });

  afterEach(() => {
    fs.writeFileSync('./dados.json', backup);
  });

  after(() => {
    fs.writeFileSync('./dados.json', backup);
    server.close();
  });

  test('1. Deve autenticar usuário pré-cadastrado e rejeitar credenciais inválidas', async () => {
    const resOk = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aluno@edu.br', senha: '123456' }),
    });
    const usuario = await resOk.json();
    assert.strictEqual(resOk.status, 200);
    assert.strictEqual(usuario.matricula, '2026001');
    assert.strictEqual(usuario.perfil, 'aluno');

    const resErro = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aluno@edu.br', senha: 'errada' }),
    });
    assert.strictEqual(resErro.status, 401);
  });

  test('2. Deve registrar novo aluno gerando matrícula sequencial e bloquear e-mail duplicado', async () => {
    const resNovo = await fetch(`${baseUrl}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Rafael Costa',
        email: 'rafael@edu.br',
        senha: '123456',
      }),
    });
    const novo = await resNovo.json();
    const anoAtual = new Date().getFullYear();
    assert.strictEqual(resNovo.status, 201);
    assert.match(novo.matricula, new RegExp(`^${anoAtual}\\d{3}$`));

    const resDuplicado = await fetch(`${baseUrl}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Outro Rafael',
        email: 'rafael@edu.br',
        senha: '123456',
      }),
    });
    assert.strictEqual(resDuplicado.status, 400);
  });

  test('3. Deve alterar senha validando a senha atual e tamanho mínimo de 6 caracteres', async () => {
    const resSenhaErrada = await fetch(`${baseUrl}/alterar-senha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 1,
        senhaAtual: '000000',
        novaSenha: '654321',
      }),
    });
    assert.strictEqual(resSenhaErrada.status, 400);

    const resSenhaCurta = await fetch(`${baseUrl}/alterar-senha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 1,
        senhaAtual: '123456',
        novaSenha: '123',
      }),
    });
    assert.strictEqual(resSenhaCurta.status, 400);

    const resOk = await fetch(`${baseUrl}/alterar-senha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 1,
        senhaAtual: '123456',
        novaSenha: '654321',
      }),
    });
    assert.strictEqual(resOk.status, 200);
  });

  test('4. Deve cadastrar disciplina com créditos e múltiplos pré-requisitos', async () => {
    const res = await fetch(`${baseUrl}/disciplinas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Arquitetura de Software',
        creditos: 6,
        preRequisitosIds: [1, 3],
      }),
    });
    const disc = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(disc.creditos, 6);
    assert.deepStrictEqual(disc.preRequisitosIds, [1, 3]);
  });

  test('5. Deve impedir oferta de turma com professor que não atua na disciplina selecionada', async () => {
    const res = await fetch(`${baseUrl}/turmas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disciplinaId: 2, // Banco de Dados I
        professorId: 1, // Carlos Eduardo atua em [1, 7]
        turno: 'Manhã',
        diaSemana: 'Segunda-feira',
        vagas: 20,
      }),
    });
    assert.strictEqual(res.status, 400);
  });

  test('6. Deve bloquear alocação de professor no mesmo dia e turno pelo professorId', async () => {
    const res = await fetch(`${baseUrl}/turmas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disciplinaId: 1,
        professorId: 1,
        turno: 'Noite',
        diaSemana: 'Terça-feira',
        vagas: 20,
      }),
    });
    assert.strictEqual(res.status, 400);
  });

  test('7. Deve bloquear alocação quando o professor atingir o limite máximo de 3 turmas no semestre', async () => {
    // Professor 1 (Carlos Eduardo) já possui 2 turmas (ids 1 e 7). A 3ª deve ser permitida:
    const resTerceira = await fetch(`${baseUrl}/turmas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disciplinaId: 1,
        professorId: 1,
        turno: 'Manhã',
        diaSemana: 'Sexta-feira',
        vagas: 25,
      }),
    });
    assert.strictEqual(resTerceira.status, 201);

    // A 4ª turma para o mesmo professor deve ser bloqueada:
    const resQuarta = await fetch(`${baseUrl}/turmas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disciplinaId: 7,
        professorId: 1,
        turno: 'Tarde',
        diaSemana: 'Sexta-feira',
        vagas: 25,
      }),
    });
    assert.strictEqual(resQuarta.status, 400);
  });

  test('8. Deve bloquear matrícula em turma com vagas esgotadas', async () => {
    const res = await fetch(`${baseUrl}/matriculas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 1,
        matriculaAluno: '2026001',
        aluno: 'Matheus',
        turmaId: 3, // Engenharia de Software (2/2 ocupadas)
      }),
    });
    assert.strictEqual(res.status, 400);
  });

  test('9. Deve bloquear matrícula duplicada na mesma disciplina e choque de horário no mesmo dia/turno', async () => {
    // Usuário 1 já cursa Turma 1 (Programação Front-End, Terça-feira Noite)
    const resDuplicada = await fetch(`${baseUrl}/matriculas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 1,
        matriculaAluno: '2026001',
        aluno: 'Matheus',
        turmaId: 1,
      }),
    });
    assert.strictEqual(resDuplicada.status, 400);

    // Turma 4 (Estrutura de Dados) também ocorre na Terça-feira Noite -> choque de horário
    const resChoque = await fetch(`${baseUrl}/matriculas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 1,
        matriculaAluno: '2026001',
        aluno: 'Matheus',
        turmaId: 4,
      }),
    });
    assert.strictEqual(resChoque.status, 400);
  });

  test('10. Deve bloquear matrícula em Banco de Dados I e Banco de Dados II no mesmo semestre', async () => {
    // Matricula o aluno em Banco de Dados I (Turma 2) no semestre atual
    const resBd1 = await fetch(`${baseUrl}/matriculas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 1,
        matriculaAluno: '2026001',
        aluno: 'Matheus',
        turmaId: 2,
      }),
    });
    assert.strictEqual(resBd1.status, 201);

    // Tenta matricular em Banco de Dados II (Turma 6, pré-req: Banco de Dados I) no mesmo semestre
    const resBd2MesmoSemestre = await fetch(`${baseUrl}/matriculas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 1,
        matriculaAluno: '2026001',
        aluno: 'Matheus',
        turmaId: 6,
      }),
    });
    const erroMesmoSemestre = await resBd2MesmoSemestre.json();
    assert.strictEqual(resBd2MesmoSemestre.status, 400);
    assert.match(erroMesmoSemestre.erro, /mesmo semestre/i);
  });

  test('11. Deve concluir automaticamente pela dataFim e liberar matrícula na disciplina dependente', async () => {
    await fetch(`${baseUrl}/matriculas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 1,
        matriculaAluno: '2026001',
        aluno: 'Matheus',
        turmaId: 2, // Banco de Dados I
      }),
    });

    // Quando a turma 2 atinge a dataFim, o ciclo automático move Banco de Dados I para concluídas
    const resDataFim = await fetch(`${baseUrl}/turmas/2/data-fim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataFim: '2026-07-10' }),
    });
    assert.strictEqual(resDataFim.status, 200);

    // Agora o aluno pode se matricular em Banco de Dados II (Turma 6)
    const resBd2 = await fetch(`${baseUrl}/matriculas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 1,
        matriculaAluno: '2026001',
        aluno: 'Matheus',
        turmaId: 6,
      }),
    });
    assert.strictEqual(resBd2.status, 201);

    // E não pode se matricular novamente em Banco de Dados I já concluída
    const resRepetida = await fetch(`${baseUrl}/matriculas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 1,
        matriculaAluno: '2026001',
        aluno: 'Matheus',
        turmaId: 2,
      }),
    });
    assert.strictEqual(resRepetida.status, 400);
  });

  test('12. Deve exigir todos os múltiplos pré-requisitos concluídos antes de liberar matrícula', async () => {
    // Turma 7 (Projeto Integrador Full-Stack) exige disciplinas 1 e 2 concluídas.
    // Conclui apenas a Turma 1 (Programação Front-End):
    await fetch(`${baseUrl}/turmas/1/data-fim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataFim: '2026-07-10' }),
    });

    // Ainda falta Banco de Dados I (id 2), então deve bloquear:
    const resFaltandoUm = await fetch(`${baseUrl}/matriculas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 1,
        matriculaAluno: '2026001',
        aluno: 'Matheus',
        turmaId: 7,
      }),
    });
    assert.strictEqual(resFaltandoUm.status, 400);

    // Matricula e conclui Banco de Dados I (Turma 2):
    await fetch(`${baseUrl}/matriculas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 1,
        matriculaAluno: '2026001',
        aluno: 'Matheus',
        turmaId: 2,
      }),
    });
    await fetch(`${baseUrl}/turmas/2/data-fim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataFim: '2026-07-10' }),
    });

    // Com ambos pré-requisitos (1 e 2) concluídos, libera a matrícula na Turma 7:
    const resLiberado = await fetch(`${baseUrl}/matriculas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 1,
        matriculaAluno: '2026001',
        aluno: 'Matheus',
        turmaId: 7,
      }),
    });
    assert.strictEqual(resLiberado.status, 201);
  });

  test('13. Deve cancelar matrícula e liberar a vaga correspondente na turma', async () => {
    const resDel = await fetch(`${baseUrl}/matriculas/101`, {
      method: 'DELETE',
    });
    assert.strictEqual(resDel.status, 200);

    const resTurmas = await fetch(`${baseUrl}/turmas`);
    const turmas = await resTurmas.json();
    const turma1 = turmas.find((t) => t.id === 1);
    assert.strictEqual(turma1.matriculados, 3);
  });
});
