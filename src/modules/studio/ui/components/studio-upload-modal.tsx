"use client";

import {Loader2Icon, PlusIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {trpc} from "@/trpc/client";
import {toast} from "sonner";
import {ResponsiveModal} from "@/components/responsive-modal";
import {StudioUploader} from "@/modules/studio/ui/components/studio-uploader";
import {router} from "next/client";

export const StudioUploadModal = () => {
    const utils = trpc.useUtils();
    const create = trpc.videos.create.useMutation({
        onSuccess: () => {
            toast.success("Video created");
            utils.studio.getMany.invalidate();
        },
        onError: () => {
            toast.error("오류가 발생하였습니다. ");
        }
    });

    const onSuccess = () => {
        if (!create.data?.video.id) return;

        create.reset();
        router.push(`/studio/videos/${create.data.video.id}`);
    };

    return (
        <>
            <ResponsiveModal
                title="Upload a video"
                open={!!create.data?.url}
                onOpenChange={() => create.reset()}
            >
                { create.data?.url ?
                    <StudioUploader endpoint={create.data.url} onSuccess={() => onSuccess}/>
                    : <Loader2Icon className="animate-spin" />
                }
            </ResponsiveModal>
            <Button variant="secondary" onClick={ () => create.mutate()} disabled={create.isPending}>
                { create.isPending ? <Loader2Icon className="animate-spin" /> : <PlusIcon/> }
                Create
            </Button>
        </>
    );
};