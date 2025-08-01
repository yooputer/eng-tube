import {VideoGetManyOutput} from "@/modules/videos/types";
import {VideoThumbnail, VideoThumbnailSkeleton} from "@/modules/videos/ui/components/video-thumbnail";
import Link from "next/link";
import {VideoInfo, VideoInfoSkeleton} from "@/modules/videos/ui/components/video-info";

interface VideoGridCardProps {
    data: VideoGetManyOutput["items"][number];
    onRemove? : () => void;
}

export const VideoGridCardSkeleton = () => {
    return (
        <div className="flex flex-col gap-2 w-full">
            <VideoThumbnailSkeleton />
            <VideoInfoSkeleton />
        </div>
    );
};


export const VideoGridCard = (
    {data, onRemove, }: VideoGridCardProps
) => {
    return (
        <div className="flex flex-col gap-2 w-full group">
            <Link prefetch href={`/videos/${data.id}`} >
                <VideoThumbnail
                    imageUrl={data.thumbnailUrl}
                    previewUrl={data.previewUrl}
                    title={data.title}
                    duration={data.duration ?? 0}
                />
            </Link>
            <VideoInfo data={data} onRemove={onRemove} />
        </div>
    );
};