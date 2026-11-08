# Sistema de Atendimento e Matrículas da Universidade

Aplicação web desenvolvida para o Desafio da disciplina de **Programação Front-End (Unisinos)**, contemplando a visão da **Instituição** (gestão de disciplinas, professores, oferta de turmas e lista de alunos) e a visão do **Estudante** (matrícula em turmas, filtros de disponibilidade/turno, grade de horários semanal, comprovante e histórico automático).

- **Demonstração Online (Vercel):** [https://desafio-front-end-unisinos.vercel.app/](https://desafio-front-end-unisinos.vercel.app/)
- **Repositório GitHub:** [https://github.com/matheusdorne/desafio-front-end-unisinos](https://github.com/matheusdorne/desafio-front-end-unisinos)
- **Autor:** Matheus Dornelles

---

## Tecnologias Utilizadas (Semanas 1 a 6)

- **Front-End:** React 18 (Componentes em Classe `extends React.Component`, ciclo de vida `componentDidMount`/`componentWillUnmount`, Elementos Funcionais sem estado, `React.createContext` / Context API e `ErrorBoundary`), Bootstrap 5 e `fetch()` nativo.
- **Back-End:** Node.js + Express (estruturado em camadas: `database/`, `repositories/` e `routes/`) + Testes Unitários nativos (`node --test`).

---

## Contas de Teste Rápido

Na tela de login há botões de preenchimento automático para os dois perfis:

- **Estudante:** `aluno@edu.br` | Senha: `123456`
- **Instituição:** `instituicao@edu.br` | Senha: `123456`

---

## Como Executar Localmente

### 1. Back-End (`http://localhost:3001`)

```bash
cd backend
npm install
npm start
```

Para rodar os **13 testes unitários automatizados** das regras de negócio:

```bash
cd backend
npm test
```

### 2. Front-End (`http://localhost:5173`)

```bash
cd frontend
npm install
npm run dev
```
