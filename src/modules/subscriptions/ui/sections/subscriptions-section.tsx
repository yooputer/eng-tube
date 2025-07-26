"use client";

import {Suspense} from "react";
import {ErrorBoundary} from "react-error-boundary";
import {DEFAULT_LIMIT} from "@/constants";
import {trpc} from "@/trpc/client";
import {InfiniteScroll} from "@/components/infinite-scroll";
import {toast} from "sonner";
import Link from "next/link";
import {SubscriptionItem, SubscriptionItemSkeleton} from "@/modules/subscriptions/ui/components/subscription-item";

export const SubscriptionsSection = () => {
    return (
        <Suspense fallback={<SubscriptionsSectionSkeleton />}>
            <ErrorBoundary fallback={<p>error</p>}>
                <SubscriptionsSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    );
};

const SubscriptionsSectionSkeleton = () => {
    return (
        <div>
            <div className="flex flex-col gap-4 gap-y-10">
                {Array.from({ length: 5 }).map((_, index) => (
                    <SubscriptionItemSkeleton key={index} />
                ))}
            </div>
        </div>
    )
}

const SubscriptionsSectionSuspense = () => {
    const utils = trpc.useUtils();
    const [subscriptions, query] = trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
        {limit: DEFAULT_LIMIT},
        {getNextPageParam : (lastPage) => lastPage.nextCursor},
    );

    const unsubscribe = trpc.subscriptions.remove.useMutation({
        onSuccess: (data) => {
            toast.success("Unsubscribed");
            utils.videos.getManySubscribed.invalidate();
            utils.users.getOne.invalidate({id: data.creatorId});
            utils.subscriptions.getMany.invalidate();
        },
        onError: () => {
            toast.error("Something went wrong");
        }
    });

    return (
        <>
            <div className="flex flex-col gap-4 gap-y-10">
                {subscriptions.pages
                    .flatMap((page) => page.items)
                    .map((subscription) => (
                        <Link key={subscription.creatorId} href={`/users/${subscription.user.id}`}>
                            <SubscriptionItem
                                name={subscription.user.name}
                                imageUrl={subscription.user.imageUrl}
                                subscriberCount={subscription.user.subscriberCount}
                                onUnsubscribe={() => {unsubscribe.mutate({userId: subscription.creatorId})}}
                                disabled={unsubscribe.isPending}
                            />
                        </Link>
                    ))
                }
            </div>

            <InfiniteScroll
                isManual
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
            />
        </>
    )
}