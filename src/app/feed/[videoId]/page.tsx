interface PageProps {
    params: Promise<{ videoId: string }>;
}

const Page = async ({ params }:PageProps) => {
    const { videoId } = await params;

    return (
        <div>
            video id : { videoId }
        </div>
    )
}

export default Page;