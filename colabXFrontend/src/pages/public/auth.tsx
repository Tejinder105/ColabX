import { Outlet, useSearchParams } from "react-router-dom";
import { InviteForm } from "../../components/invite-form";

export default function AuthPage() {
    const [searchParams] = useSearchParams();
    const invite = searchParams.get("invite");

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-5xl">
                {invite ? <InviteForm /> : <Outlet />}
            </div>
        </div>
    );
}
