import {PlaylistsGetManyOutput} from "@/modules/playlists/types";
import React from "react";
import Link from "next/link";
import {
    PlaylistThumbnail,
    PlaylistThumbnailSkeleton
} from "@/modules/playlists/ui/components/playlist-grid-card/playlist-thumbnail";
import {PlaylistInfo, PlaylistInfoSkeleton} from "@/modules/playlists/ui/components/playlist-grid-card/playlist-info";

interface PlaylistGridCardProps {
    data: PlaylistsGetManyOutput["items"][number];
}

export const PlaylistGridCardSkeleton = () => {
    return (
        <div className="flex flex-col gap-2 w-full group">
            <PlaylistThumbnailSkeleton/>
            <PlaylistInfoSkeleton/>
        </div>
    )
}

export const PlaylistGridCard = (
    {data}: PlaylistGridCardProps
) => {
    return (
        <Link prefetch href={`playlists/${data.id}`}>
            <div className="flex flex-col gap-2 w-full group">
                <PlaylistThumbnail
                    imageUrl={data.thumbnailUrl}
                    title={data.name}
                    videoCount={data.playlistVideoCount}
                />
                <PlaylistInfo data={data}/>
            </div>
        </Link>
    );
};
