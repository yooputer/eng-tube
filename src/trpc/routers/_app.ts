import { createTRPCRouter } from '../init';
import {categoriesRouter} from "@/modules/categories/server/procedures";
import {studioRouter} from "@/modules/studio/server/procedures";
import {videosRouter} from "@/modules/videos/server/procedures";
import {videoViewsRouter} from "@/modules/video-views/server/procedures";
import {videoReactionsRouter} from "@/modules/video-reactions/server/procedures";
import {subscriptionsRouter} from "@/modules/subscriptions/server/procedures";
import {commentsRouter} from "@/modules/comments/server/procedures";
import {commentReactionsRouter} from "@/modules/comment-reactions/server/procedures";

export const appRouter = createTRPCRouter({
    categories:categoriesRouter,
    studio: studioRouter,
    videos: videosRouter,
    videoViews: videoViewsRouter,
    videoReactions: videoReactionsRouter,
    subscriptions: subscriptionsRouter,
    comments: commentsRouter,
    commentReactions: commentReactionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;