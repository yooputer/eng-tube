import {useState} from "react";
import {cn} from "@/lib/utils";
import {ChevronDownIcon, ChevronUpIcon} from "lucide-react";

interface VideoDescriptionProps {
    compactViews: string;
    expandedViews: string;
    compactDate: string;
    expandedDate: string;
    description?: string | null;
};

export const VideoDescription = (
    {compactViews, expandedViews, compactDate, expandedDate, description}: VideoDescriptionProps
) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className="bg-secondary/50 rounded-xl p-3 cursor-pointer hover:bg-secondary/70 transition"
        >
            <div
                className="flex gap-2 text-sm mb-2"
            >
                <span className="font-medium">
                    {isExpanded ? expandedViews : compactViews} views
                </span>
                <span className="font-medium">
                    {isExpanded ? expandedDate : compactDate}
                </span>
            </div>

            <div className="relative">
                <p
                    className={cn(
                        "text-sm whitespace-pre-wrap",
                        !isExpanded && "line-clamp-2"
                    )}
                >
                    {description || 'no description'}
                </p>

                <div
                    className="flex items-center gap-1 mt-4 text-sm font-medium"
                    onClick={() => setIsExpanded((current) => !current)}
                >
                    {isExpanded ? (
                        <>
                            Show less <ChevronUpIcon className="size-4"/>
                        </>
                    ) : (
                        <>
                            Show more <ChevronDownIcon className="size-4"/>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
