"use client";

import {trpc} from "@/trpc/client";
import {DEFAULT_LIMIT} from "@/constants";
import {Suspense} from "react";
import {ErrorBoundary} from "react-error-boundary";
import {InfiniteScroll} from "@/components/infinite-scroll";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Link from "next/link";

export const VideosSection = () => {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <ErrorBoundary fallback={<p>Error...</p>}>
                <VideosSectionSuspense/>
            </ErrorBoundary>
        </Suspense>
    );
};

const VideosSectionSuspense = () => {
    const [ videos, query ] = trpc.studio.getMany.useSuspenseInfiniteQuery({
        limit: DEFAULT_LIMIT,
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    return (
        <div>
            <div className="border-y">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6 w-[510px]">Video</TableHead>
                            <TableHead>Visibility</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Views</TableHead>
                            <TableHead className="text-right">Comments</TableHead>
                            <TableHead className="text-right pr-6">Likes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {videos.pages.flatMap((page) => page.items)
                            .map((video) => (
                                <TableRow key={video.id} >
                                    <TableCell className="pl-6 w-[510px]">
                                        <Link href={`/studio/videos/${video.id}`}>
                                            {video.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>Visibility</TableCell>
                                    <TableCell>{ video.muxStatus }</TableCell>
                                    <TableCell>{video.createdAt.toISOString()}</TableCell>
                                    <TableCell className="text-right">0</TableCell>
                                    <TableCell className="text-right">0</TableCell>
                                    <TableCell className="text-right pr-6">0</TableCell>
                                </TableRow>


                            ))
                        }
                    </TableBody>
                </Table>
            </div>
            <InfiniteScroll hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} fetchNextPage={query.fetchNextPage} />
        </div>
    );
};
