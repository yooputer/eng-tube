import {cva, VariantProps} from "class-variance-authority";
import {VideoGetManyOutput} from "@/modules/videos/types";
import Link from "next/link";
import {VideoThumbnail, VideoThumbnailSkeleton} from "@/modules/videos/ui/components/video-thumbnail";
import {cn} from "@/lib/utils";
import {UserAvatar} from "@/components/user-avatar";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {UserInfo} from "@/modules/users/ui/components/user-info";
import {VideoMenu} from "@/modules/videos/ui/components/video-menu";
import {useMemo} from "react";
import {Skeleton} from "@/components/ui/skeleton";

const videoRowCardVariants = cva("group flex min-w-0", {
    variants: {
        size: {
            default: "gap-4",
            compact: "gap-2",
        },
    },
    defaultVariants: {
        size: "default",
    },
});

const thumbnailVariants = cva("relative flex-none", {
    variants: {
        size: {
            default: "w-[38%]",
            compact: "w-[168px]",
        }
    },
    defaultVariants: {
        size: "default",
    },
});

interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants>{
    data: VideoGetManyOutput["items"][number];
    onRemove? : () => void;
}


export const VideoRowCardSkeleton = ({ size = "default" }: VariantProps<typeof videoRowCardVariants>) => {
    return (
        <div className={videoRowCardVariants({ size })}>
            {/* Thumbnail skeleton */}
            <div className={thumbnailVariants({ size })}>
                <VideoThumbnailSkeleton />
            </div>

            {/* Info skeleton */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-x-2">
                    <div className="flex-1 min-w-0">
                        <Skeleton
                            className={cn("h-5 w-[40%]", size === "compact" && "h-4 w-[40%]")}
                        />
                        {size === "default" && (
                            <>
                                <Skeleton className="h-4 w-[20%] mt-1" />
                                <div className="flex items-center gap-2 my-3">
                                    <Skeleton className="size-8 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </>
                        )}
                        {size === "compact" && (
                            <>
                                <Skeleton className="h-4 w-[50%] mt-1" />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const VideoRowCard = (
    { data, onRemove, size = "default", }:  VideoRowCardProps
) => {
    const compactViews = useMemo(() => {
        return Intl.NumberFormat("en", {
            notation: "compact"
        }).format(data.viewCount);
    }, [data.viewCount]);

    const compactLikes = useMemo(() => {
        return Intl.NumberFormat("en", {
            notation: "compact"
        }).format(data.likeCount);
    }, [data.likeCount]);

    return (
        <div className={videoRowCardVariants({size})}>
            {/* 썸네일 */}
            <Link prefetch href={`/videos/${data.id}`} className={thumbnailVariants({size})}>
                <VideoThumbnail
                    imageUrl={data.thumbnailUrl}
                    previewUrl={data.previewUrl}
                    title={data.title}
                    duration={data.duration ?? 0}
                />
            </Link>

            {/* info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-x-2">
                    <Link prefetch href={`/videos/${data.id}`} className="flex-1 min-w-0" >
                        <h3
                            className={cn(
                                "font-medium line-clamp-2",
                                size==="compact" ? "text-sm" : "text-base",
                            )}
                        >
                            {data.title}
                        </h3>

                        {size === "default" && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {data.viewCount} views · {data.likeCount} likes
                            </p>
                        )}

                        {size === "default" && (
                            <>
                                <div className="flex items-center gap-2 my-3">
                                    <UserAvatar size="sm" imageUrl={data.user.imageUrl} name={data.user.name}/>
                                    <UserInfo size="sm" name={data.user.name} />
                                </div>

                                <Tooltip>
                                    <TooltipTrigger>
                                        <p className="text-xs text-muted-foreground w-fit line-clamp-2">
                                            {data.description ?? "No description"}
                                        </p>
                                    </TooltipTrigger>

                                    <TooltipContent side="bottom" align="center" className="bg-black/70">
                                        <p>From the video description</p>
                                    </TooltipContent>
                                </Tooltip>
                            </>
                        )}

                        {size === "compact" && (
                            <UserInfo size="sm" name={data.user.name} />
                        )}

                        {size === "compact" && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {compactViews} views · {compactLikes} likes
                            </p>
                        )}
                    </Link>

                    <div className="flex-none">
                        <VideoMenu videoId={data.id} onRemove={onRemove} variant="ghost"/>
                    </div>
                </div>
            </div>
        </div>
    );
};