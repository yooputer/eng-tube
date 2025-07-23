import {CommentGetManyOutput} from "@/modules/comments/types";
import {UserAvatar} from "@/components/user-avatar";
import Link from "next/link";
import {formatDistanceToNow} from "date-fns";
import {trpc} from "@/trpc/client";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    MoreVerticalIcon,
    ThumbsDownIcon,
    ThumbsUpIcon,
    TrashIcon
} from "lucide-react";
import React, {useState} from "react";
import {useAuth, useClerk} from "@clerk/nextjs";
import {toast} from "sonner";
import {cn} from "@/lib/utils";
import {CommentForm} from "@/modules/comments/ui/components/comment-form";
import {CommentReplies} from "@/modules/comments/ui/components/comment-replies";

interface CommentItemProps {
    comment: CommentGetManyOutput["items"][number];
    variant? : "comment" | "reply";
}

export const CommentItem = (
    { comment, variant="comment", }: CommentItemProps
) => {
    const {userId} = useAuth();
    const utils = trpc.useUtils();
    const clerk = useClerk();

    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const [isRepliesOpen, setIsRepliesOpen] = useState(false);

    const remove = trpc.comments.remove.useMutation({
        onSuccess: () => {
            toast.success("Comment deleted");
            utils.comments.getMany.invalidate({videoId: comment.videoId});
        },
        onError: (error) => {
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }else{
                toast.error("error");
            }
        },
    });

    const like = trpc.commentReactions.like.useMutation({
        onSuccess: () => {
            utils.comments.getMany.invalidate({videoId: comment.videoId});
        },
        onError: (error) => {
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        },
    })

    const dislike = trpc.commentReactions.dislike.useMutation({
        onSuccess: () => {
            utils.comments.getMany.invalidate({videoId: comment.videoId});
        },
        onError: (error) => {
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        },
    })

    return (
        <div>
            <div className="flex gap-4">
                <Link prefetch href={`/users/${comment.userId}`}>
                    <UserAvatar
                        imageUrl={comment.user.imageUrl}
                        name={comment.user.name}
                        size={variant === "comment" ? "lg" : "sm"}
                    />
                </Link>

                <div className="flex-1 min-w-0">
                    <Link prefetch href={`/users/${comment.userId}`}>
                        <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm pb-0.5">
                            {comment.user.name}
                        </span>
                            <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(comment.createdAt, {addSuffix: true,})}
                        </span>
                        </div>
                    </Link>

                    <p className="text-sm">
                        {comment.value}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                            <Button
                                disabled={like.isPending}
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => {
                                    like.mutate({commentId: comment.id})
                                }}
                            >
                                <ThumbsUpIcon className={cn(comment.viewerReactions === "like" && 'fill-black')}/>
                            </Button>
                            <span className="text-xs text-muted-foreground">
                            {comment.likeCount}
                        </span>

                            <Button
                                disabled={dislike.isPending}
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => {
                                    dislike.mutate({commentId: comment.id})
                                }}
                            >
                                <ThumbsDownIcon className={cn(comment.viewerReactions === "dislike" && 'fill-black')}/>
                            </Button>

                            <span className="text-xs text-muted-foreground">
                            {comment.dislikeCount}
                        </span>
                        </div>

                        {variant === "comment" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={() => setIsReplyOpen(true)}
                            >
                                Reply
                            </Button>
                        )}
                    </div>
                </div>

                {comment.user.clerkId === userId && (
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVerticalIcon/>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            {comment.user.clerkId === userId && (
                                <DropdownMenuItem onClick={() => remove.mutate({id: comment.id})}>
                                    <TrashIcon className="size-4"/>
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {isReplyOpen && variant === "comment" && (
                <div className="mt-4 pl-14">
                    <CommentForm
                        variant="reply"
                        videoId={comment.videoId}
                        parentId={comment.id}
                        onSuccess={() => {
                            setIsReplyOpen(false);
                            setIsRepliesOpen(true);
                        }}
                        onCancel={() => {
                            setIsReplyOpen(false);

                        }}
                    />
                </div>
            )}


            {comment.replyCount > 0 && variant === "comment" && (
                <div className="pl-14">
                    <Button
                        variant="tertiary"
                        size="sm"
                        className="h-8"
                        onClick={() => setIsRepliesOpen((current) => !current)}
                    >
                        {isRepliesOpen ? <ChevronUpIcon/> : <ChevronDownIcon/>}
                        {comment.replyCount} replies
                    </Button>
                </div>
            )}

            {comment.replyCount > 0 && variant === "comment" && isRepliesOpen &&  (
                <CommentReplies videoId={comment.videoId} parentId={comment.id} />
            )}
        </div>
    );
};
