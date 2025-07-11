import {DEFAULT_LIMIT} from "@/constants";
import {trpc} from "@/trpc/client";
import {Loader2Icon} from "lucide-react";
import {CommentItem} from "@/modules/comments/ui/components/comment-item";
import {Button} from "@/components/ui/button";

interface CommentRepliesProps {
    videoId: string;
    parentId: string;
}

export const CommentReplies = (
    {videoId, parentId}: CommentRepliesProps
) => {
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = trpc.comments.getMany.useInfiniteQuery({
        videoId,
        parentId,
        limit: DEFAULT_LIMIT,
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor
    });

    return (
        <div className="pl-14">
            <div className="flex flex-col gap-4 mt-2">
                {isLoading && (
                    <div className="flex items-center justify-center">
                        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!isLoading && data?.pages
                    .flatMap((page) => page.items)
                    .map((reply) => (
                        <CommentItem key={reply.id} variant="reply" comment={reply} />
                    ))
                }
            </div>

            {hasNextPage && (
                <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                >
                    더보기
                </Button>
            )}
        </div>
    );
};