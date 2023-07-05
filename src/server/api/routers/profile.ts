import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const profileRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id }, ctx }) => {
      const currentUserId = ctx.session?.user.id
      const profile = await ctx.prisma.user.findUnique({
        where: { id },
        select: {
          name: true,
          image: true,
          _count: {
            select: {
              followers: true,
              following: true,
              tweets: true,
            },
          },
          followers:
            currentUserId == null
              ? undefined
              : { where: { id: currentUserId } },
        },
      })
      if (profile == null) return
      return {
        name: profile.name,
        image: profile.image,
        followersCount: profile._count.followers,
        followingCount: profile._count.following,
        tweetsCount: profile._count.tweets,
        isFollowing: profile.followers.length > 0,
      }
    }),
})
