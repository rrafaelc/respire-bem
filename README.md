# Respire Bem

Projeto Integrador Interdisciplinar — 3º Semestre, Fatec Itapira.

Desenvolvido por estudantes do curso de **Desenvolvimento de Software Multiplataforma**, o Respire Bem monitora a qualidade do ar em bairros de Itapira/SP usando sensores baseados em Arduino. Os dados coletados são enviados para uma plataforma web onde qualquer pessoa pode acompanhar em tempo real a qualidade do ar na cidade, identificar áreas com altos níveis de poluição e promover consciência ambiental na comunidade.

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Rodar

```bash
docker compose up --build
```

Na primeira execução o build leva alguns minutos. Aguardar as mensagens de seed antes de abrir o browser.

| Serviço  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000       |
| API      | http://localhost:3001/api   |

## Conta demo

| Campo | Valor                       |
|-------|-----------------------------|
| Email | demo@rafaelcostadev.com     |
| Senha | demo123                     |

Na página `/login` os campos já vêm preenchidos — basta clicar em **Entrar**.  
A conta demo pode visualizar dados e iniciar simulação, mas não pode criar sensores.

## Resetar dados

```bash
docker compose down -v
docker compose up --build
```

## Estrutura

```
respire-bem/
├── backend/    Fastify + Prisma (PostgreSQL) + Mongoose (MongoDB)
├── frontend/   Next.js 14 App Router + Leaflet
├── docker-compose.dev-db.yml   Somente bancos (para desenvolvimento local)
└── docker-compose.yml
```

## Repositórios originais

Este repositório é um monorepo que reúne os projetos originais para execução integrada via Docker:

| Parte     | Repositório                                                             |
|-----------|-------------------------------------------------------------------------|
| Backend   | [rrafaelc/respirebem-api](https://github.com/rrafaelc/respirebem-api)  |
| Frontend  | [rrafaelc/PI-3-Semestre](https://github.com/rrafaelc/PI-3-Semestre)   |

## Stack

| Camada    | Tecnologias                                              |
|-----------|----------------------------------------------------------|
| Hardware  | Arduino (sensores de poluentes atmosféricos)             |
| Backend   | Node.js · Fastify · TypeScript · Prisma · Mongoose       |
| Banco     | PostgreSQL (usuários/sensores) · MongoDB (dados/CEPs)    |
| Frontend  | Next.js 14 · React 18 · MUI · Tailwind · Leaflet         |
| Infra     | Docker · Docker Compose                                  |
