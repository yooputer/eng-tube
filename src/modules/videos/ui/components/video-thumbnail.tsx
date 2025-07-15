import Image from "next/image";
import {formatDuration} from "@/lib/utils";
import {Skeleton} from "@/components/ui/skeleton";

interface VideoThumbnailProps {
    title: string;
    imageUrl?: string | null;
    previewUrl?: string | null;
    duration: number;
}

export const VideoThumbnailSkeleton = () => {
    return (
        <div className="relative w-full overflow-hidden rounded-xl aspect-video">
            <Skeleton className="size-full" />
        </div>
    );
};

export const VideoThumbnail = (
    { title, imageUrl, previewUrl, duration }: VideoThumbnailProps
) => {
    return (
        <div className="relative group">
            {/* 썸네일 wrapper */}
            <div className="relative w-full overflow-hidden rounded-xl aspect-video">
                {/* 썸네일 */}
                <Image
                    src={imageUrl ?? '/placeholder.svg'}
                    alt={title}
                    fill
                    className="h-full w-full object-cover group-hover:opacity-0"
                />

                {/* 프리뷰 */}
                <Image
                    unoptimized={!!previewUrl}
                    src={previewUrl ?? '/placeholder.svg'}
                    alt={title}
                    fill
                    className="h-full w-full object-cover opacity-0 group-hover:opacity-100"
                />
            </div>

            {/* Video duration box */}
            <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-sm font-medium">
                {formatDuration(duration)}
            </div>
        </div>
    );
};
