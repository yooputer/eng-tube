import {CategoriesSection} from "@/modules/search/ui/sections/categories-section";
import {ResultSection} from "@/modules/search/ui/sections/result-section";

interface SearchViewProps {
    query?: string;
    categoryId?: string;
}

export const SearchView = async (
    {query, categoryId,}: SearchViewProps
) => {
    return (
        <div className="max-w-[1300px] mx-auto mb-10 flex flex-col gap-y-6 px-4 pt-2.5">
            <CategoriesSection categoryId={categoryId} />
            <ResultSection query={query} categoryId={categoryId} />
        </div>
    );
};