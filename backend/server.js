import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import instituicaoRoutes from './routes/instituicaoRoutes.js';
import matriculasRoutes from './routes/matriculasRoutes.js';

export const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(instituicaoRoutes);
app.use(matriculasRoutes);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}
