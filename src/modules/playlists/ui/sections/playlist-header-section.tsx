"use client";

import {ErrorBoundary} from "react-error-boundary";
import {Suspense} from "react";
import {Button} from "@/components/ui/button";
import {TrashIcon} from "lucide-react";
import {trpc} from "@/trpc/client";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {Skeleton} from "@/components/ui/skeleton";

interface PlaylistHeaderSectionProps {
    playlistId: string;
}

export const PlaylistHeaderSection = (
    {playlistId}: PlaylistHeaderSectionProps
) => {
    return (
        <Suspense fallback={<PlaylistHeaderSectionSkeleton />}>
            <ErrorBoundary fallback={<p>error...</p>}>
                <PlaylistHeaderSectionSuspense playlistId={playlistId} />
            </ErrorBoundary>
        </Suspense>
    );
};

export const PlaylistHeaderSectionSkeleton = () => {
    return (
        <div className="flex flex-col gap-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
        </div>
    );
};

const PlaylistHeaderSectionSuspense = (
    {playlistId}: PlaylistHeaderSectionProps
) => {
    const utils = trpc.useUtils();
    const router = useRouter();

    const [playlist] = trpc.playlists.getOne.useSuspenseQuery({playlistId});
    const remove = trpc.playlists.remove.useMutation({
        onSuccess: () => {
            toast.success("Playlist removed");
            utils.playlists.getMany.invalidate();
            router.push("/playlists");
        },
        onError: () => {
            toast.error("error");
        }
    });

    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">{playlist.name}</h1>
                <p className="text-xs text-muted-foreground">
                    Videos from the playlist
                </p>
            </div>

            <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => remove.mutate({playlistId})}
            >
                <TrashIcon />
            </Button>
        </div>
    )
}