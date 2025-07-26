"use client";

import {Suspense} from "react";
import {ErrorBoundary} from "react-error-boundary";
import {trpc} from "@/trpc/client";
import {UserPageBanner, UserPageBannerSkeleton} from "@/modules/users/ui/components/user-page-banner";
import {UserPageInfo, UserPageInfoSkeleton} from "@/modules/users/ui/components/user-page-info";
import {Separator} from "@/components/ui/separator";

interface UserSectionProps {
    userId: string;
}

export const UserSection = (props: UserSectionProps) => {
    return (
        <Suspense fallback={<UserSectionSkeleton/>}>
            <ErrorBoundary fallback={<p>error...</p>}>
                <UserSectionSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    );
};

const UserSectionSkeleton = () => {
    return (
        <div className="flex flex-col">
            <UserPageBannerSkeleton />
            <UserPageInfoSkeleton />
            <Separator />
        </div>
    )
}

const UserSectionSuspense = (
    {userId} : UserSectionProps
) => {
    const [user] = trpc.users.getOne.useSuspenseQuery({id: userId});

    return (
        <div className="flex flex-col">
            <UserPageBanner user={user} />
            <UserPageInfo user={user} />
            <Separator />
        </div>
    )
}