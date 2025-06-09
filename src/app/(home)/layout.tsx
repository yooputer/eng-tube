import React from "react";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }:LayoutProps) => {
    return (
        <div>
            <div>this is home! </div>
            { children }
        </div>
    )
}

export default Layout;