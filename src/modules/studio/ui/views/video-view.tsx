import {FormSection} from "@/modules/studio/ui/sections/form-section";

interface ViewProps {
    videoId: string;
}

export const VideoView = ({ videoId }: ViewProps) => {
    return (
        <div className="px-4 pt-2.5 max-w-screen-lg">
            <FormSection videoId={videoId} />
        </div>
    );
};
