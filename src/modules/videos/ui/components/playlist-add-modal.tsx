import {trpc} from "@/trpc/client";
import {ResponsiveModal} from "@/components/responsive-modal";
import {DEFAULT_LIMIT} from "@/constants";
import {Loader2Icon, SquareCheckIcon, SquareIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {InfiniteScroll} from "@/components/infinite-scroll";
import {toast} from "sonner";

interface PlaylistAddModalProps {
    videoId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const PlaylistAddModal = (
    { videoId, open, onOpenChange, }: PlaylistAddModalProps
) => {
    const utils = trpc.useUtils();

    const {
        data: playlists,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = trpc.playlists.getManyForVideo.useInfiniteQuery({videoId, limit: DEFAULT_LIMIT}, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!videoId && open,
    });

    const addVideo = trpc.playlists.addVideo.useMutation({
        onSuccess: (data) => {
            toast.success("Video added to playlist");
            utils.playlists.getManyForVideo.invalidate({videoId});
            utils.playlists.getMany.invalidate();
            utils.playlists.getVideos.invalidate({playlistId: data.playlistId, limit: DEFAULT_LIMIT});
        },
        onError: () => {
            toast.success("Something went wrong.");
        }
    })

    const removeVideo = trpc.playlists.removeVideo.useMutation({
        onSuccess: (data) => {
            toast.success("Video removed to playlist");
            utils.playlists.getManyForVideo.invalidate({videoId});
            utils.playlists.getMany.invalidate();
            utils.playlists.getVideos.invalidate({playlistId: data.playlistId, limit: DEFAULT_LIMIT});
        },
        onError: () => {
            toast.success("Something went wrong.");
        }
    })

    return (
        <ResponsiveModal
            title="Add to playlist"
            open={open}
            onOpenChange={onOpenChange}
        >
            <div className="flex flex-col gap-2">
                {isLoading && (
                    <div className="flex justify-center p-4">
                        <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!isLoading && playlists?.pages
                    .flatMap((page) => page.items)
                    .map((playlist) => (
                        <Button
                            key={playlist.id}
                            variant="ghost"
                            className="w-full justify-start px-2 [&_svg]:size-5"
                            size="lg"
                            onClick={() => {
                                if (playlist.containsVideo) {
                                    removeVideo.mutate({playlistId: playlist.id, videoId});
                                }else{
                                    addVideo.mutate({playlistId: playlist.id, videoId});
                                }
                            }}
                            disabled={removeVideo.isPending || addVideo.isPending}
                        >
                            {playlist.containsVideo
                                ? (<SquareCheckIcon className="mr-2" />)
                                : (<SquareIcon className="mr-2" />)
                            }

                            {playlist.name}
                        </Button>
                    ))
                }

                {!isLoading && (
                    <InfiniteScroll
                        isManual
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                    />
                )}
            </div>
        </ResponsiveModal>
    );
};