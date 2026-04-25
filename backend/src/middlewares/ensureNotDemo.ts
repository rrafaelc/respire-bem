import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? 'demo@rafaelcostadev.com';

export const ensureNotDemo = (
  request: FastifyRequest,

  reply: FastifyReply,

  done: HookHandlerDoneFunction,
) => {
  if (request.user?.email === DEMO_EMAIL) {
    reply
      .code(403)
      .send({ message: 'Conta demonstração - operações de escrita estão desabilitadas' });

    return;
  }

  done();
};
