import {VideoGetOneOutput} from "@/modules/videos/types";
import {VideoOwner} from "@/modules/videos/ui/components/video-owner";
import {VideoReactions} from "@/modules/videos/ui/components/video-reactions";
import {VideoMenu} from "@/modules/videos/ui/components/video-menu";
import {VideoDescription} from "@/modules/videos/ui/components/video-description";
import {useMemo} from "react";
import {formatDistanceToNow} from "date-fns";

interface VideoTopRowProps {
    video: VideoGetOneOutput;
}

export const VideoTopRow = ({video}: VideoTopRowProps) => {
    const viewCount = video.viewCount;

    const compactViews = useMemo(() => {
        return Intl.NumberFormat('en', {
            notation: 'compact'
        }).format(viewCount);
    }, []);

    const expandedViews = useMemo(() => {
        return Intl.NumberFormat('en', {
            notation: 'standard'
        }).format(viewCount);
    }, []);

    const compactDate = useMemo(() => {
        return formatDistanceToNow(video.createdAt, {addSuffix: true});
    }, [video.createdAt]);

    const expandedDate = useMemo(() => {
        return formatDistanceToNow(video.createdAt, 'd MMM yyyy');
    }, [video.createdAt]);

    return (
        <div className="flex flex-col gap-4 mt-4">
            <h1 className="text-xl font-semibold">{video.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap4">
                <VideoOwner user={video.user} videoId={video.id} />
                <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2">
                    <VideoReactions
                        videoId={video.id}
                        likes={video.likeCount}
                        dislikes={video.dislikeCount}
                        viewerReaction={video.viewerReaction}
                    />
                    <VideoMenu videoId={video.id} />
                </div>
            </div>

            <VideoDescription
                compactViews={compactViews}
                expandedViews={expandedViews}
                compactDate={compactDate}
                expandedDate={expandedDate}
                description={video.description}
            >

            </VideoDescription>
        </div>
    );
};