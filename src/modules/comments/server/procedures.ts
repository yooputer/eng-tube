import {baseProcedure, createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {z} from "zod";
import {db} from "@/db";
import {comments, users} from "@/db/schema";
import {and, count, desc, eq, getTableColumns, lt, or} from "drizzle-orm";
import {TRPCError} from "@trpc/server";

export const commentsRouter = createTRPCRouter({
    remove: protectedProcedure
        .input(z.object({id: z.string().uuid()}))
        .mutation(async ({input, ctx}) => {
            const {id: commentId} = input;
            const {id: userId} = ctx.user;

            const [deletedComment] = await db
                .delete(comments)
                .where(and(
                    eq(comments.id, commentId),
                    eq(comments.userId, userId),
                ))
                .returning();

            if (!deletedComment) {
                throw new TRPCError({code: "NOT_FOUND"});
            }

            return deletedComment;
        }),
    create: protectedProcedure
        .input(z.object({
            videoId: z.string().uuid(),
            value: z.string(),
        }))
        .mutation(async ({input, ctx}) => {
            const { videoId, value, } = input;
            const {id: userId} = ctx.user;

            const [createdComment] = await db
                .insert(comments)
                .values({
                    userId,
                    videoId,
                    value,
                })
                .returning();

            return createdComment;
        }),
    getMany: baseProcedure
        .input(z.object({
            videoId: z.string().uuid(),
            cursor: z.object({
                id: z.string().uuid(),
                updatedAt: z.date(),
            }).nullish(),
            limit: z.number().min(1).max(100),
        }))
        .query(async ({input}) => {
            const {videoId, cursor, limit} = input;

            const [[totalData], data] = await Promise.all([
                db
                    .select({
                        count: count(),
                    })
                    .from(comments)
                    .where(eq(comments.videoId, videoId)),
                db
                    .select({
                        ...getTableColumns(comments),
                        user: users,
                    })
                    .from(comments)
                    .where(and(
                        eq(comments.videoId, videoId),
                        cursor ?
                            or(
                                lt(comments.updatedAt, cursor.updatedAt),
                                and(
                                    eq(comments.updatedAt, cursor.updatedAt),
                                    lt(comments.id, cursor.id)
                                ))
                            : undefined,
                    ))
                    .innerJoin(users, eq(comments.userId, users.id))
                    .orderBy(desc(comments.updatedAt), desc(comments.id))
                    .limit(limit + 1)
            ])

            const hasMore = data.length > limit;
            const items = hasMore ? data.slice(0, -1) : data;

            const lastItem = items[items.length - 1];
            const nextCursor = hasMore ? { id: lastItem.id, updatedAt: lastItem.updatedAt } : null;

            return {
                totalCount: totalData.count,
                items,
                nextCursor
            };
        }),
})