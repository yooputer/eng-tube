import {and, desc, eq, getTableColumns, lt, or, sql} from "drizzle-orm";
import {createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {db} from "@/db";
import {playlists, playlistVideos, users, videoReactions, videos, videoViews} from "@/db/schema";
import {z} from "zod";
import {TRPCError} from "@trpc/server";

export const playlistsRouter = createTRPCRouter({
    addVideo: protectedProcedure
        .input(
            z.object({
                playlistId: z.string().uuid(),
                videoId: z.string().uuid(),
            })
        )
        .mutation( async ({ input, ctx }) => {
            const { playlistId, videoId } = input;
            const {id: userId} = ctx.user;

            const [existingPlaylist] = await db
                .select()
                .from(playlists)
                .where(eq(playlists.id, playlistId));

            if (!existingPlaylist) {
                throw new TRPCError({code: "NOT_FOUND"});
            }

            if (existingPlaylist.userId !== userId) {
                throw new TRPCError({code: "FORBIDDEN"});
            }

            const [existingVideo] = await db
                .select()
                .from(videos)
                .where(eq(videos.id, videoId));

            if (!existingVideo) {
                throw new TRPCError({code: "NOT_FOUND"});
            }

            const [existingPlaylistVideo] = await db
                .select()
                .from(playlistVideos)
                .where(and(
                    eq(playlistVideos.playlistId, playlistId),
                    eq(playlistVideos.videoId, videoId),
                ));

            if (existingPlaylistVideo) {
                throw new TRPCError({code: "CONFLICT"});
            }

            const [createdPlaylistVideo] = await db
                .insert(playlistVideos)
                .values({
                    playlistId,
                    videoId,
                })
                .onConflictDoNothing()
                .returning();

            return createdPlaylistVideo;
        }),
    removeVideo: protectedProcedure
        .input(
            z.object({
                playlistId: z.string().uuid(),
                videoId: z.string().uuid(),
            })
        )
        .mutation( async ({ input, ctx }) => {
            const { playlistId, videoId } = input;
            const {id: userId} = ctx.user;

            const [existingPlaylist] = await db
                .select()
                .from(playlists)
                .where(eq(playlists.id, playlistId));

            if (!existingPlaylist) {
                throw new TRPCError({code: "NOT_FOUND"});
            }

            if (existingPlaylist.userId !== userId) {
                throw new TRPCError({code: "FORBIDDEN"});
            }

            const [existingVideo] = await db
                .select()
                .from(videos)
                .where(eq(videos.id, videoId));

            if (!existingVideo) {
                throw new TRPCError({code: "NOT_FOUND"});
            }

            const [existingPlaylistVideo] = await db
                .select()
                .from(playlistVideos)
                .where(and(
                    eq(playlistVideos.playlistId, playlistId),
                    eq(playlistVideos.videoId, videoId),
                ))

            if (!existingPlaylistVideo) {
                throw new TRPCError({code: "NOT_FOUND"});
            }

            const [deletedPlaylistVideo] = await db
                .delete(playlistVideos)
                .where(and(
                    eq(playlistVideos.playlistId, playlistId),
                    eq(playlistVideos.videoId, videoId),
                ))
                .returning();

            return deletedPlaylistVideo;
        }),
    getManyForVideo: protectedProcedure
        .input(
            z.object({
                videoId: z.string().uuid(),
                cursor: z.object({
                    id: z.string().uuid(),
                    updatedAt: z.date(),
                }).nullish(),
                limit: z.number().min(1).max(100),
            })
        )
        .query( async ({ input, ctx }) => {
            const { videoId, cursor, limit } = input;
            const {id: userId} = ctx.user;

            const data = await db
                .select({
                    ...getTableColumns(playlists),
                    playlistVideoCount: db.$count(playlistVideos, eq(playlists.id, playlistVideos.playlistId)),
                    user: users,
                    containsVideo: videoId
                        ? sql<boolean>`(
                            SELECT EXISTS (
                                SELECT 1
                                FROM ${playlistVideos} pv
                                WHERE pv.playlist_id = ${playlists.id} AND pv.video_id = ${videoId})
                            )`
                        : sql<boolean>`false`,
                })
                .from(playlists)
                .innerJoin(users, eq(playlists.userId, users.id))
                .where(and(
                    eq(playlists.userId, userId),
                    cursor ? or(
                            lt(playlists.updatedAt, cursor.updatedAt),
                            and(
                                eq(playlists.updatedAt, cursor.updatedAt),
                                lt(playlists.id, cursor.id)
                            ))
                        : undefined,
                ))
                .orderBy(desc(playlists.updatedAt), desc(playlists.id))
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
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
            })
        )
        .mutation( async ({ input, ctx }) => {
            const { name } = input;
            const {id: userId} = ctx.user;

            const [createdPlaylist] = await db
                .insert(playlists)
                .values({
                    userId,
                    name,
                })
                .returning();

            if (!createdPlaylist) {
                throw new TRPCError({code: "BAD_REQUEST"});
            }

            return createdPlaylist;
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
        .query( async ({ input, ctx }) => {
            const { cursor, limit } = input;
            const {id: userId} = ctx.user;

            const data = await db
                .select({
                    ...getTableColumns(playlists),
                    playlistVideoCount: db.$count(playlistVideos, eq(playlists.id, playlistVideos.playlistId)),
                    user: users,
                    thumbnailUrl: sql<string | null>`(
                        SELECT v.thumbnail_url
                        FROM ${playlistVideos} pv 
                        JOIN ${videos} v ON v.id = pv.video_id
                        WHERE pv.playlist_id = ${playlists.id}
                        ORDER BY pv.updated_at DESC
                        LIMIT 1 )`
                })
                .from(playlists)
                .innerJoin(users, eq(playlists.userId, users.id))
                .where(and(
                    eq(playlists.userId, userId),
                    cursor ? or(
                            lt(playlists.updatedAt, cursor.updatedAt),
                            and(
                                eq(playlists.updatedAt, cursor.updatedAt),
                                lt(playlists.id, cursor.id)
                            ))
                        : undefined,
                ))
                .orderBy(desc(playlists.updatedAt), desc(playlists.id))
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