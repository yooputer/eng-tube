"use client";

import {Loader2Icon, PlusIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {trpc} from "@/trpc/client";
import {toast} from "sonner";

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

    return (
        <Button variant="secondary" onClick={ () => create.mutate()} disabled={create.isPending}>
            { create.isPending ? <Loader2Icon className="animate-spin" /> : <PlusIcon/> }
            Create
        </Button>
    );
};