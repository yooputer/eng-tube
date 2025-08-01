import {UserSection} from "@/modules/users/ui/sections/user-section";
import {VideosSection} from "@/modules/users/ui/components/videos-section";

interface UserViewProps {
    userId: string;
}

export const UserView = (
    {userId, }: UserViewProps
) => {
    return (
        <div className="flex flex-col max-w-[1300px] px-4 pt-2.5 mx-auto mb-10 gap-y-6">
            <UserSection userId={userId} />
            <VideosSection userId={userId} />
        </div>
    );
};