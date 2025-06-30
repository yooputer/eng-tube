import {createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {db} from "@/db";
import {videos} from "@/db/schema";
import {z} from "zod";
import {and, desc, eq, lt, or} from "drizzle-orm";
import {TRPCError} from "@trpc/server";

export const studioRouter = createTRPCRouter({
    getOne: protectedProcedure
        .input(
            z.object({
                id: z.string().uuid()
            })
        )
        .query( async ({ctx, input}) => {
            const {id: userId} = ctx.user;
            const {id} = input;

            const [video] = await db
                .select()
                .from(videos)
                .where(
                    and(
                        eq(videos.id, id),
                        eq(videos.userId, userId)
                    )
                )

            if(!video){
                throw new TRPCError({ code: "NOT_FOUND"});
            }

            return video;
        }),
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
        .query( async ({ ctx, input }) => {
            const { cursor, limit } = input;
            const { id: userId } = ctx.user;

            const data = await db
                .select()
                .from(videos)
                .where(and(
                    eq(videos.userId, userId),
                    cursor ? or(
                        lt(videos.updatedAt, cursor.updatedAt),
                        and(
                            eq(videos.updatedAt, cursor.updatedAt),
                            lt(videos.id, cursor.id)
                        ))
                        : undefined,
                ))
                .orderBy(desc(videos.updatedAt), desc(videos.id))
                .limit(limit + 1);

            // 만약 조회한 비디오의 개수가 (limit + 1)과 같으면 조회할 데이터가 있다는 뜻.
            // 마지막 아이템은 지우고 반환
            const hasMore = data.length > limit;
            const items = hasMore ? data.slice(0, -1) : data;

            const lastItem = items[items.length - 1];
            const nextCursor = hasMore ? { id: lastItem.id, updatedAt: lastItem.updatedAt } : null;

            return {
                items,
                nextCursor
            };
        }),
})