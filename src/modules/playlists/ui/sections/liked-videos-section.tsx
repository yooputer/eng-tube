"use client";

import {Suspense} from "react";
import {ErrorBoundary} from "react-error-boundary";
import {DEFAULT_LIMIT} from "@/constants";
import {trpc} from "@/trpc/client";
import {VideoGridCard, VideoGridCardSkeleton,} from "@/modules/videos/ui/components/video-grid-card";
import {InfiniteScroll} from "@/components/infinite-scroll";
import {VideoRowCard, VideoRowCardSkeleton} from "@/modules/videos/ui/components/video-row-card";

export const LikedVideosSection = () => {
    return (
        <Suspense fallback={<LikedVideosSectionSkeleton />}>
            <ErrorBoundary fallback={<p>error</p>}>
                <LikedVideosSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    );
};

const LikedVideosSectionSkeleton = () => {
    return (
        <div>
            <div className="flex flex-col gap-4 gap-y-10 md:hidden">
                {Array.from({ length: 18 }).map((_, index) => (
                    <VideoGridCardSkeleton key={index} />
                ))
                }
            </div>
            <div className="hidden flex-col gap-4 md:flex">
                {Array.from({ length: 18 }).map((_, index) => (
                    <VideoRowCardSkeleton key={index} size="compact" />
                ))
                }
            </div>
        </div>
    )
}

const LikedVideosSectionSuspense = () => {
    const [videos, query] = trpc.playlists.getLiked.useSuspenseInfiniteQuery(
        {limit: DEFAULT_LIMIT},
        {getNextPageParam : (lastPage) => lastPage.nextCursor},
    );

    return (
        <>
            <div className="flex flex-col gap-4 gap-y-10 md:hidden">
                {videos.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoGridCard key={video.id} data={video} />
                    ))
                }
            </div>
            <div className="hidden flex-col gap-4 md:flex">
                {videos.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoRowCard key={video.id} data={video} size="compact" />
                    ))
                }
            </div>
            <InfiniteScroll
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
            />
        </>
    )
}