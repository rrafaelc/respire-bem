# CLAUDE.md — Respire Bem Monorepo

Projeto IoT de monitoramento de qualidade do ar. Sensores Arduino coletam dados em Itapira/SP e exibem num mapa interativo.

## Como rodar

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:3001/api
- Postgres: localhost:5432 (user/pass/db: respirebem)
- MongoDB: localhost:27017/respirebem

## Arquitetura

```
respire-bem/
├── backend/    Node.js + Fastify v4 + TypeScript
│              Prisma v5 → PostgreSQL (users, sensors)
│              Mongoose v8 → MongoDB (sensorData, cepData)
│              DI via tsyringe
│              Padrão: Routes → Controllers → UseCases → Repositories
│
├── frontend/  Next.js 14 App Router + React 18 + TypeScript
│              MUI v5 + Tailwind CSS
│              Leaflet + react-leaflet (mapa de Itapira)
│              Auth: JWT em localStorage
│
└── docker-compose.yml  Postgres 16.3 + MongoDB 7.0.12 + backend + frontend
```

## Versões fixadas (Docker)

| Serviço  | Image                  |
|----------|------------------------|
| Node     | node:20.13.1-alpine    |
| Postgres | postgres:16.3-alpine   |
| MongoDB  | mongo:7.0.12           |

## Conta demo

- Email: `demo@rafaelcostadev.com`
- Senha: `demo123`
- Seedada automaticamente via `backend/prisma/seed.ts`
- Campos pré-preenchidos em `frontend/src/app/login/page.tsx`
- Escrita bloqueada via middleware `ensureNotDemo` (POST /api/sensor retorna 403)

## Seeds (automáticos, idempotentes)

Ordem de execução no `backend/docker-entrypoint.sh`:
1. `prisma migrate deploy` — aplica migrations pendentes
2. `node dist/prisma/seed.js` — cria user demo + 4 sensores no Postgres
3. `node dist/scripts/seed-mongo.js` — insere 50 SensorData + CepData por sensor no MongoDB

Para rodar manualmente (fora do Docker):
```bash
cd backend
npm run seed        # Postgres
npm run seed:mongo  # MongoDB
```

Resetar tudo: `docker compose down -v && docker compose up --build`

## Arquivos-chave

| Arquivo | O que faz |
|---------|-----------|
| `backend/docker-entrypoint.sh` | Migrate → seed PG → seed Mongo → start |
| `backend/src/middlewares/ensureNotDemo.ts` | Bloqueia escrita para o user demo |
| `backend/src/routes/api/sensor/index.ts` | POST usa `[ensureAuthenticated, ensureNotDemo]` |
| `backend/prisma/seed.ts` | Seed Postgres: user demo + 4 sensores |
| `backend/scripts/seed-mongo.ts` | Seed MongoDB: 50 SensorData + CepData |
| `frontend/src/app/utils/constants.ts` | `API_URL` lê `NEXT_PUBLIC_API_URL` (build-time) |
| `frontend/src/app/login/page.tsx` | Campos pré-preenchidos com credenciais demo |

## Endpoints da API

| Método | Rota | Auth | Demo |
|--------|------|------|------|
| POST | `/api/auth/login` | Não | OK |
| GET | `/api/sensor` | Não | OK |
| GET | `/api/sensor/:id` | Não | OK |
| GET | `/api/sensor/user` | Sim | OK |
| POST | `/api/sensor` | Sim | 403 bloqueado |
| GET | `/api/sensorData/:sensor_id` | Não | OK |
| POST | `/api/sensorData/simulation` | Sim | OK (inicia timer) |

## Limitações conhecidas

- Cards de qualidade do ar na home são estáticos (não vêm da API)
- Simulação para automaticamente após 5 minutos
- `POST /api/user` está bloqueado intencionalmente no controller (erro proposital)
- `NEXT_PUBLIC_API_URL` é resolvido em build-time — mudar requer rebuild do frontend
- 4 posições de sensores no mapa são hardcoded em `frontend/src/app/mapa/mapa.tsx`

## O que NÃO fazer

- Não subir credenciais reais — este repo é demo público
- Não remover `ensureNotDemo` do POST `/api/sensor`
- Não mudar `DEMO_EMAIL` sem rodar seed novo
- Se adicionar nova rota de escrita autenticada, adicionar `ensureNotDemo` também
- Não usar tag `:latest` nas imagens Docker — usar versões fixadas acima
