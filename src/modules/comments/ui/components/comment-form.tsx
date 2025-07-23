import {UserAvatar} from "@/components/user-avatar";
import {useClerk, useUser} from "@clerk/nextjs";
import React from "react";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {commentInsertSchema} from "@/db/schema";
import {zodResolver} from "@hookform/resolvers/zod";
import {trpc} from "@/trpc/client";
import {toast} from "sonner";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";

interface CommentFormProps {
    videoId: string;
    parentId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    variant?: "comment" | "reply";
}

export const CommentForm = (
    { videoId, parentId, onSuccess, onCancel, variant = "comment" }: CommentFormProps
) => {
    const {user} = useUser();
    const clerk = useClerk();
    const create = trpc.comments.create.useMutation({
        onSuccess: () => {
            utils.comments.getMany.invalidate({videoId});
            utils.comments.getMany.invalidate({videoId, parentId});
            form.reset();
            toast.success("comment added");
            onSuccess?.();
        },
        onError: (error) => {
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        }
    });
    const utils = trpc.useUtils();

    const form = useForm<z.infer<typeof commentInsertSchema>>({
        resolver: zodResolver(commentInsertSchema.omit({ userId: true })),
        defaultValues: {
            parentId: parentId,
            videoId: videoId,
            value: "",
        },
    });

    const handleSubmit = (values: z.infer<typeof commentInsertSchema>) => {
        create.mutate(values);
    };

    const handleCancel = () => {
        form.reset();
        onCancel?.();
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex gap-4 group"
            >
                <UserAvatar
                    imageUrl={user?.imageUrl || '/user-placeholder.svg'}
                    name={user?.username || 'User'}
                    size="lg"
                />

                <div className="flex-1">
                    <FormField
                        name="value"
                        control={form.control}
                        render={({field}) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder={`Add a ${variant}...`}
                                        className="resize-none bg-transparent overflow-hidden min-h-0"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="justify-end gap-2 mt-2 flex">
                        {onCancel && (
                            <Button type="button" variant="ghost" size="sm" onClick={handleCancel} >
                                Cancel
                            </Button>
                        )}

                        <Button
                            type="submit"
                            size="sm"
                        >
                            {variant === "reply" ? "Reply" : "Comment"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
};
