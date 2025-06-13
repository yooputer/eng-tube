import {HydrateClient, trpc} from "@/trpc/server";
import {PageClient} from "@/app/(home)/client";
import {Suspense} from "react";
import {ErrorBoundary} from "react-error-boundary";

export default async function Home() {
    void trpc.hello.prefetch({text:"Antonio"});

  return (
      <HydrateClient>
          <Suspense fallback={<p>Loading...</p>}>
              <ErrorBoundary fallback={<p>Error....</p>}>
                  <PageClient/>
              </ErrorBoundary>
          </Suspense>
      </HydrateClient>
  )
}