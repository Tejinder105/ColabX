import { Outlet } from "react-router-dom";

export default function AuthPage() {

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-5xl">
                <Outlet />
            </div>
        </div>
    );
}
