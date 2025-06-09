import React from "react";
import { HomeLayout } from "@/modules/home/ui/layouts/home-layout/home-layout";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }:LayoutProps) => {
    return (
        <HomeLayout>
            {children}
        </HomeLayout>
    )
}

export default Layout;