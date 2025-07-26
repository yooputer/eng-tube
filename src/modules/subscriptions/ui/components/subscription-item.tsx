import {UserAvatar} from "@/components/user-avatar";
import {SubscriptionButton} from "@/modules/subscriptions/ui/components/subscription-button";
import {Skeleton} from "@/components/ui/skeleton";

interface SubscriptionItemProps {
    name: string;
    imageUrl: string;
    subscriberCount: number;
    onUnsubscribe: () => void;
    disabled: boolean;
}

export const SubscriptionItemSkeleton = () => {
    return (
        <div className="flex items-start gap-4">
            <Skeleton className="size-10 rounded-full" />

            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="mt-1 h-3 w-20" />
                    </div>

                    <Skeleton className="h-8 w-20 rounded-full" />
                </div>
            </div>
        </div>
    )
}

export const SubscriptionItem = (
    {name, imageUrl, subscriberCount, onUnsubscribe, disabled, }: SubscriptionItemProps
) => {
    return (
        <div className="flex items-start gap-4">
            <UserAvatar size="lg" imageUrl={imageUrl} name={name} />

            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm">
                            {name}
                        </h3>
                        <p className="text-xs text-muted-forground">
                            {subscriberCount.toLocaleString()} subscribers
                        </p>
                    </div>

                    <SubscriptionButton
                        onClick={(e) => {
                            e.preventDefault();
                            onUnsubscribe();
                        }}
                        disabled={disabled}
                        isSubscribed
                    />
                </div>
            </div>
        </div>
    );
};