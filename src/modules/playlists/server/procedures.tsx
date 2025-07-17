import {and, desc, eq, getTableColumns, lt, or} from "drizzle-orm";
import {createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {db} from "@/db";
import {users, videoReactions, videos, videoViews} from "@/db/schema";
import {z} from "zod";

export const playlistsRouter = createTRPCRouter({
    getHistory: protectedProcedure
        .input(
            z.object({
                cursor: z.object({
                    id: z.string().uuid(),
                    viewedAt: z.date(),
                }).nullish(),
                limit: z.number().min(1).max(100),
            })
        )
        .query( async ({ input, ctx }) => {
            const { cursor, limit } = input;
            const {id: userId} = ctx.user;

            const viewerVideoViews = db.$with('viewer_video_views').as(
                db
                    .select({
                        videoId: videoViews.videoId,
                        viewedAt: videoViews.updatedAt,
                    })
                    .from(videoViews)
                    .where(eq(videoViews.userId, userId))
            );

            const data = await db
                .with(viewerVideoViews)
                .select({
                    ...getTableColumns(videos),
                    user: users,
                    viewedAt: viewerVideoViews.viewedAt,
                    viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
                    likeCount: db.$count(videoReactions, and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "like"))),
                    dislikeCount: db.$count(videoReactions, and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "dislike"))),
                })
                .from(videos)
                .innerJoin(users, eq(videos.userId, users.id))
                .innerJoin(viewerVideoViews, eq(videos.id, viewerVideoViews.videoId))
                .where(and(
                    eq(videos.visibility, "public"),
                    cursor ? or(
                            lt(viewerVideoViews.viewedAt, cursor.viewedAt),
                            and(
                                eq(viewerVideoViews.viewedAt, cursor.viewedAt),
                                lt(videos.id, cursor.id)
                            ))
                        : undefined,
                ))
                .orderBy(desc(viewerVideoViews.viewedAt), desc(videos.id))
                .limit(limit + 1);

            // 만약 조회한 비디오의 개수가 (limit + 1)과 같으면 조회할 데이터가 있다는 뜻.
            // 마지막 아이템은 지우고 반환
            const hasMore = data.length > limit;
            const items = hasMore ? data.slice(0, -1) : data;

            const lastItem = items[items.length - 1];
            const nextCursor = hasMore ? { id: lastItem.id, viewedAt: lastItem.viewedAt } : null;

            return {
                items,
                nextCursor
            };
        }),
    getLiked: protectedProcedure
        .input(
            z.object({
                cursor: z.object({
                    id: z.string().uuid(),
                    likedAt: z.date(),
                }).nullish(),
                limit: z.number().min(1).max(100),
            })
        )
        .query( async ({ input, ctx }) => {
            const { cursor, limit } = input;
            const {id: userId} = ctx.user;

            const likedVideos = db.$with('liked_videos').as(
                db
                    .select({
                        videoId: videoReactions.videoId,
                        likedAt: videoReactions.updatedAt,
                    })
                    .from(videoReactions)
                    .where(and(
                        eq(videoReactions.userId, userId),
                        eq(videoReactions.type, "like"),
                    ))
            );

            const data = await db
                .with(likedVideos)
                .select({
                    ...getTableColumns(videos),
                    user: users,
                    likedAt: likedVideos.likedAt,
                    viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
                    likeCount: db.$count(videoReactions, and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "like"))),
                    dislikeCount: db.$count(videoReactions, and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "dislike"))),
                })
                .from(videos)
                .innerJoin(users, eq(videos.userId, users.id))
                .innerJoin(likedVideos, eq(videos.id, likedVideos.videoId))
                .where(and(
                    eq(videos.visibility, "public"),
                    cursor ? or(
                            lt(likedVideos.likedAt, cursor.likedAt),
                            and(
                                eq(likedVideos.likedAt, cursor.likedAt),
                                lt(videos.id, cursor.id)
                            ))
                        : undefined,
                ))
                .orderBy(desc(likedVideos.likedAt), desc(videos.id))
                .limit(limit + 1);

            // 만약 조회한 비디오의 개수가 (limit + 1)과 같으면 조회할 데이터가 있다는 뜻.
            // 마지막 아이템은 지우고 반환
            const hasMore = data.length > limit;
            const items = hasMore ? data.slice(0, -1) : data;

            const lastItem = items[items.length - 1];
            const nextCursor = hasMore ? { id: lastItem.id, likedAt: lastItem.likedAt } : null;

            return {
                items,
                nextCursor
            };
        }),
})