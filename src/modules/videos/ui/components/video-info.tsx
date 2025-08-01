import Link from "next/link";
import {UserAvatar} from "@/components/user-avatar";
import {UserInfo} from "@/modules/users/ui/components/user-info";
import {VideoMenu} from "@/modules/videos/ui/components/video-menu";
import {VideoGetManyOutput} from "@/modules/videos/types";
import {useMemo} from "react";
import {formatDistanceToNow} from "date-fns";
import {Skeleton} from "@/components/ui/skeleton";

interface VideoInfoProps {
    data: VideoGetManyOutput["items"][number];
    onRemove? : () => void;
}

export const VideoInfoSkeleton = () => {
    return (
        <div className="flex gap-3">
            <Skeleton className="size-10 flex-shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-[90%]" />
                <Skeleton className="h-5 w-[70%]" />
            </div>
        </div>
    );
};

export const VideoInfo = (
    {data, onRemove, }: VideoInfoProps
) => {
    const compactViews = useMemo(() => {
        return Intl.NumberFormat("en", {
            notation: "compact"
        }).format(data.viewCount);
    }, [data.viewCount]);

    const compactDate = useMemo(() => {
        return formatDistanceToNow(data.createdAt, {addSuffix: true});
    }, [data.createdAt]);

    return (
        <div className="flex gap-3">
            <Link prefetch href={`/users/${data.user.id}`}>
                <UserAvatar size="sm" imageUrl={data.user.imageUrl} name={data.user.name}/>
            </Link>

            <div className="min-w-0 flex-1">
                <Link prefetch href={`/videos/${data.id}`} >
                    <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-base break-words">
                        {data.title}
                    </h3>
                </Link>

                <Link prefetch href={`/users/${data.user.id}`}>
                    <UserInfo size="sm" name={data.user.name} />
                </Link>

                <Link prefetch href={`/videos/${data.id}`} >
                    <p>
                        {compactViews} views * {compactDate}
                    </p>
                </Link>
            </div>

            <div className="shrink-0">
                <VideoMenu videoId={data.id} onRemove={onRemove} variant="ghost"/>
            </div>
        </div>
    );
};