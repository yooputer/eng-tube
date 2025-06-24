import { createTRPCRouter } from '../init';
import {categoriesRouter} from "@/modules/categories/server/procedures";
import {videosRouter} from "@/modules/videos/server/procedures";

export const appRouter = createTRPCRouter({
    categories:categoriesRouter,
    videos: videosRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;