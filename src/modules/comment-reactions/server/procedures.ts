import {createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {z} from "zod";
import {db} from "@/db";
import {commentReactions} from "@/db/schema";
import {and, eq} from "drizzle-orm";

export const commentReactionsRouter = createTRPCRouter({
    like: protectedProcedure
        .input(z.object({commentId: z.string().uuid()}))
        .mutation(async ({input, ctx}) => {
            const {commentId} = input;
            const {id: userId} = ctx.user;

            /* like reaction이 존재하는 경우 delete */
            const [existingCommentReaction] = await db
                .select()
                .from(commentReactions)
                .where(
                    and(
                      eq(commentReactions.commentId, commentId),
                      eq(commentReactions.userId, userId),
                      eq(commentReactions.type, "like"),
                    )
                );

            if (existingCommentReaction) {
                const [deletedViewerReaction] = await db
                    .delete(commentReactions)
                    .where(and(
                        eq(commentReactions.userId, userId),
                        eq(commentReactions.commentId, commentId),
                    ))
                    .returning();

                return deletedViewerReaction;
            }

            /* dislike reaction이 존재하는 경우 like로 upsert */
            const [createdCommentReaction] = await db
                .insert(commentReactions)
                .values ({userId, commentId, type: "like"})
                .onConflictDoUpdate({
                    target: [commentReactions.userId, commentReactions.commentId],
                    set: {
                        type: "like",
                    }
                })
                .returning();

            return createdCommentReaction;
        }),
    dislike: protectedProcedure
        .input(z.object({commentId: z.string().uuid()}))
        .mutation(async ({input, ctx}) => {
            const {commentId} = input;
            const {id: userId} = ctx.user;

            /* dislike reaction이 존재하는 경우 delete */
            const [existingCommentReaction] = await db
                .select()
                .from(commentReactions)
                .where(
                    and(
                        eq(commentReactions.commentId, commentId),
                        eq(commentReactions.userId, userId),
                        eq(commentReactions.type, "dislike"),
                    )
                );

            if (existingCommentReaction) {
                const [deletedViewerReaction] = await db
                    .delete(commentReactions)
                    .where(and(
                        eq(commentReactions.userId, userId),
                        eq(commentReactions.commentId, commentId),
                    ))
                    .returning();

                return deletedViewerReaction;
            }

            /* like reaction이 존재하는 경우 dislike로 upsert */
            const [createdCommentReaction] = await db
                .insert(commentReactions)
                .values ({userId, commentId, type: "dislike"})
                .onConflictDoUpdate({
                    target: [commentReactions.userId, commentReactions.commentId],
                    set: {
                        type: "dislike",
                    }
                })
                .returning();

            return createdCommentReaction;
        })
})