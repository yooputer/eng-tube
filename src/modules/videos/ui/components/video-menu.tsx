import {ListPlusIcon, MoreVerticalIcon, ShareIcon, Trash2Icon} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";


interface VideoMenuProps {
    videoId: string;
    variant?: "ghost" | "secondary";
    onRemove?: () => void;
}

export const VideoMenu = (
    {videoId, variant, onRemove, }: VideoMenuProps
) => {
    const onShare = () => {
        /* TODO: 배포 url 세팅*/
        const fullUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/videos/${videoId}`;

        navigator.clipboard.writeText(fullUrl);

        toast.success("URL이 복사되었습니다. ");
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    size="icon"
                    className="rounded-full"
                >
                    <MoreVerticalIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onShare()}>
                    <ShareIcon className="mr-2 size-4" />
                    Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}> {/* TODO 재생목록 추가 기능 구현 */}
                    <ListPlusIcon className="mr-2 size-4" />
                    Add to playlist
                </DropdownMenuItem>

                {onRemove && (
                    <DropdownMenuItem onClick={() => {}}> {/* TODO 재생목록 삭제 기능 구현 */}
                        <Trash2Icon className="mr-2 size-4" />
                        Remove
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
