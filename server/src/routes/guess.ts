import {prisma} from "../lib/prisma";
import {FastifyInstance} from "fastify";
import {authenticate} from "../plugins/authenticate";
import {z} from "zod";

export async function guessRoutes(fastify: FastifyInstance) {
  fastify.get('/guesses/count', async () => {
    const count = await prisma.guess.count()

    return {count}
  })

  fastify.post('/polls/:pollId/games/:gameId/guesses', {
    onRequest: [authenticate]
  }, async (request, reply) => {
    const createGuessParams = z.object({
      pollId: z.string(),
      gameId: z.string(),
    })

    const createGuessBody = z.object({
      firstTeamPoints: z.number(),
      secondTeamPoints: z.number(),
    })

    const {pollId, gameId} = createGuessParams.parse(request.params)
    const {firstTeamPoints, secondTeamPoints} = createGuessBody.parse(request.body)

    const participant = await prisma.participant.findUnique({
      where: {
        userId_pollId: {
          userId: request.user.sub,
          pollId,
        }
      }
    })

    if (!participant) {
      return reply.status(400).send({message: 'Participant not found in this poll'})
    }

    const guess = await prisma.guess.findUnique({
      where: {
        participantId_gameId: {
          participantId: participant.id,
          gameId,
        }
      }
    })

    if (guess) {
      return reply.status(400).send({message: 'User already guessed'})
    }

    const game = await prisma.game.findUnique({
      where: {
        id: gameId,
      },
    })

    if (!game) {
      return reply.status(400).send({message: 'Game not found'})
    }

    if (game.date < new Date()) {
      return reply.status(403).send({message: 'Game already started'})
    }

    await prisma.guess.create({
      data: {
        firstTeamPoints,
        secondTeamPoints,
        participantId: participant.id,
        gameId,
      }
    })

    return reply.status(201).send()

  })
}
