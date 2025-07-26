import {createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {z} from "zod";
import {db} from "@/db";
import {subscriptions, users,} from "@/db/schema";
import {and, desc, eq, getTableColumns, lt, or} from "drizzle-orm";
import {TRPCError} from "@trpc/server";

export const subscriptionsRouter = createTRPCRouter({
    getMany: protectedProcedure
        .input(
            z.object({
                cursor: z.object({
                    id: z.string().uuid(),
                    updatedAt: z.date(),
                }).nullish(),
                limit: z.number().min(1).max(100),
            })
        )
        .query( async ({ input, ctx }) => {
            const { cursor, limit } = input;
            const { id: userId } = ctx.user;

            const data = await db
                .select({
                    ...getTableColumns(subscriptions),
                    user: {
                        ...getTableColumns(users),
                        subscriberCount: db.$count(subscriptions, eq(subscriptions.creatorId, users.id)),
                    },
                })
                .from(subscriptions)
                .innerJoin(users, eq(subscriptions.creatorId, users.id))
                .where(and(
                    eq(subscriptions.viewerId, userId),
                    cursor ? or(
                            lt(subscriptions.updatedAt, cursor.updatedAt),
                            and(
                                eq(subscriptions.updatedAt, cursor.updatedAt),
                                lt(subscriptions.creatorId, cursor.id)
                            ))
                        : undefined,
                ))
                .orderBy(desc(subscriptions.updatedAt), desc(subscriptions.creatorId))
                .limit(limit + 1);

            // 만약 조회한 비디오의 개수가 (limit + 1)과 같으면 조회할 데이터가 있다는 뜻.
            // 마지막 아이템은 지우고 반환
            const hasMore = data.length > limit;
            const items = hasMore ? data.slice(0, -1) : data;

            const lastItem = items[items.length - 1];
            const nextCursor = hasMore ? { id: lastItem.creatorId, updatedAt: lastItem.updatedAt } : null;

            return {
                items,
                nextCursor
            };
        }),
    create: protectedProcedure
        .input(z.object({userId: z.string().uuid()}))
        .mutation(async ({input, ctx}) => {
            const {userId} = input;

            if (userId === ctx.user.id) {
                throw new TRPCError(({code: "BAD_REQUEST"}));
            }

            const [createdSubscription] = await db
                .insert(subscriptions)
                .values({
                    viewerId: ctx.user.id,
                    creatorId: userId,
                })
                .returning();

            return createdSubscription;
        }),
    remove: protectedProcedure
        .input(z.object({userId: z.string().uuid()}))
        .mutation(async ({input, ctx}) => {
            const {userId} = input;

            if (userId === ctx.user.id) {
                throw new TRPCError(({code: "BAD_REQUEST"}));
            }

            const [deletedSubscription] = await db
                .delete(subscriptions)
                .where(and(
                    eq(subscriptions.viewerId, ctx.user.id),
                    eq(subscriptions.creatorId, userId),
                ))
                .returning();

            return deletedSubscription;
        }),
})