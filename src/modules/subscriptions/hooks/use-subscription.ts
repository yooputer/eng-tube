import {useClerk} from "@clerk/nextjs";
import {trpc} from "@/trpc/client";
import {toast} from "sonner";

interface UseSubscriptionProps{
    userId: string;
    isSubscribed: boolean;
    fromVideoId?: string;
}

export const useSubscription = (
    {userId, isSubscribed, fromVideoId}: UseSubscriptionProps
) => {
    const clerk = useClerk();
    const utils = trpc.useUtils();

    const subscribe = trpc.subscriptions.create.useMutation({
        onSuccess: () => {
            toast.success("Subscribed");
            utils.users.getOne.invalidate({id: userId});

            if (fromVideoId) {
                utils.videos.getOne.invalidate({id: fromVideoId});
            }
        },
        onError: (error) => {
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }else{
                toast.error("Something went wrong");
            }
        }
    });
    const unsubscribe = trpc.subscriptions.remove.useMutation({
        onSuccess: () => {
            toast.success("Unsubscribed");
            utils.videos.getManySubscribed.invalidate();
            utils.users.getOne.invalidate({id: userId});

            if (fromVideoId) {
                utils.videos.getOne.invalidate({id: fromVideoId});
            }
        },
        onError: (error) => {
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }else{
                toast.error("Something went wrong");
            }
        }
    });

    const isPending = subscribe.isPending || unsubscribe.isPending;

    const onClick = () => {
        if (isSubscribed) {
            unsubscribe.mutate({userId});
        }else {
            subscribe.mutate({userId});
        }
    }

    return {
        isPending,
        onClick
    }
}