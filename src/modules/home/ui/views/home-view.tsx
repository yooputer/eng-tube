import {CategoriesSection} from "@/modules/home/ui/sections/categories-section";
import {HomeVideosSection} from "@/modules/home/ui/sections/home-videos-section";

interface HomeViewProps {
    categoryId?: string;
}

const HomeView = ({categoryId}: HomeViewProps) => {
    return (
        <div className="max-w-[2400px] mx-auth mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
            <CategoriesSection categoryId={categoryId} />
            <HomeVideosSection categoryId={categoryId} />
        </div>
    );
};

export default HomeView;