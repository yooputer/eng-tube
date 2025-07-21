import {PlaylistsGetManyOutput} from "@/modules/playlists/types";
import {Skeleton} from "@/components/ui/skeleton";

interface PlaylistInfoProps {
    data: PlaylistsGetManyOutput["items"][number];
}

export const PlaylistInfoSkeleton = () => {
    return (
        <div className="flex gap-3">
            <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-[90%]" />
            </div>
        </div>
    );
};

export const PlaylistInfo = (
    {data}: PlaylistInfoProps
) => {
    return (
        <div className="flex gap-3">
            <div className="min-w-0 flex-1">
                <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-sm break-words">
                    {data.name}
                </h3>
            </div>

        </div>
    );
};
