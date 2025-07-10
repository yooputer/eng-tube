import {CommentGetManyOutput} from "@/modules/comments/types";
import {UserAvatar} from "@/components/user-avatar";
import Link from "next/link";
import {formatDistanceToNow} from "date-fns";
import {trpc} from "@/trpc/client";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {MoreVerticalIcon, TrashIcon} from "lucide-react";
import React from "react";
import {useAuth, useClerk} from "@clerk/nextjs";
import {toast} from "sonner";

interface CommentItemProps {
    comment: CommentGetManyOutput["items"][number];
}

export const CommentItem = (
    {comment}: CommentItemProps
) => {
    const {userId} = useAuth();
    const utils = trpc.useUtils();
    const clerk = useClerk();

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

    return (
        <div className="flex gap-4">
            <div className="flex gap-4">
                <Link href={`/users/${comment.userId}`}>
                    <UserAvatar imageUrl={comment.user.imageUrl} name={comment.user.name} size="lg"/>
                </Link>
            </div>
            <div className="flex-1 min-w-0">
                <Link href={`/users/${comment.userId}`} >
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm pb-0.5">
                            {comment.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(comment.createdAt, {addSuffix: true, })}
                        </span>
                    </div>
                </Link>

                <p className="text-sm">
                    {comment.value}
                </p>

                {/* TODO: 댓글 리액션 구현 */}
            </div>

            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVerticalIcon/>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">

                    {comment.user.clerkId === userId && (
                        <DropdownMenuItem onClick={() => remove.mutate({ id: comment.id })}>
                            <TrashIcon className="size-4 mr-2"/>
                            Delete
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
