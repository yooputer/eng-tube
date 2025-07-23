import {useUser} from "@clerk/nextjs";
import {SidebarGroup, SidebarHeader, SidebarMenuButton, SidebarMenuItem, useSidebar} from "@/components/ui/sidebar";
import {UserAvatar} from "@/components/user-avatar";
import Link from "next/link";
import {Skeleton} from "@/components/ui/skeleton";

export const StudioSidebarHeader = () => {
    const { user } = useUser();
    const { state } = useSidebar();

    if (!user) {
        return (
            <SidebarHeader className="flex items-center justify-center pb-4">
                <Skeleton className="size-[112px] rounded-full"/>
                <div className="flex flex-col items-center mt-2 gap-y-2">
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-4 w-[100px]" />
                </div>
            </SidebarHeader>
        )
    }

    if (state === "collapsed") {
        return (
            <SidebarGroup>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Your profile" asChild>
                        <Link prefetch href="/users/current">
                            <UserAvatar
                                imageUrl={user.imageUrl}
                                name={user.fullName ?? 'User'}
                                size="xs"
                            />
                            <span className="text-sm">Your profile</span>
                        </Link>

                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarGroup>
        )
    }

    return (
        <SidebarHeader className="flex items-center justify-center pb-4">
            <Link prefetch href="/users/current">
                <UserAvatar
                    imageUrl={user?.imageUrl}
                    name={user?.fullName ?? "User"}
                    className="size-[112px] hover:opacity-80 transition-opacity">
                </UserAvatar>
            </Link>

            <div className="flex flex-col items-center mt-2">
                <p className="text-sm font-medium">
                    Your Profile
                </p>
                <p className="text-xs text-muted-foreground">
                    { user.fullName }
                </p>
            </div>
        </SidebarHeader>
    );
};