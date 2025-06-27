import {createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {db} from "@/db";
import {videos} from "@/db/schema";
import {mux} from "@/lib/mux";

export const videosRouter = createTRPCRouter({
    create: protectedProcedure.mutation(async ({ ctx }) => {
        const {id: userId} = ctx.user;
        const upload = await mux.video.uploads.create({
            new_asset_settings: {
                passthrough: userId,
                playback_policy: ["public"],
                input: [
                    {
                        generated_subtitles: [
                            {
                                language_code: "en",
                                name: "English",
                            }
                        ]
                    }
                ],
            },
            cors_origin: '*',   /* TODO: 운영환경에서는 url 세팅 필요 */
        })

        const [video] = await db
            .insert(videos)
            .values({
                userId,
                title: "Untitled",
                muxStatus: 'waiting',
                muxUploadId: upload.id,
            })
            .returning();

        return {
            video: video,
            url: upload.url,
        }
    })
})