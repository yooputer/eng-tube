 "use client";

import {Button} from "@/components/ui/button";
import {ClapperboardIcon, UserCircleIcon, UserIcon} from "lucide-react";
 import {SignedIn, SignedOut, SignInButton, UserButton} from "@clerk/nextjs";

export const AuthButton = () => {
    // TODO: Add different auth states

    return (
        <>
            <SignedIn>
                <UserButton>
                    <UserButton.MenuItems>
                        <UserButton.Link
                            href="/users/current"
                            label="My Profile"
                            labelIcon={<UserIcon className="size-4" />}
                        />
                        <UserButton.Link
                            href="/studio"
                            label="Studio"
                            labelIcon={<ClapperboardIcon className="size-4" />}
                        />
                        <UserButton.Action label="manageAccount" />
                    </UserButton.MenuItems>
                </UserButton>
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal">
                    <Button variant="outline"
                            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500/20 rounded-full shadow-none [&_svg]:size-5"
                    >
                        <UserCircleIcon/>
                        Sign in
                    </Button>
                </SignInButton>
            </SignedOut>
        </>
    );
};