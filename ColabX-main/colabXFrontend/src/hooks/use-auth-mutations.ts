import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signupUser, signinUser } from "@/services/authservices";

export function useSignupMutation() {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: signupUser,
        onSuccess: () => {
            navigate("/onboarding");
        },
        onError: (error) => {
            console.error("Signup failed:", error);
        },
    });
}

export function useSigninMutation() {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: signinUser,
        onSuccess: () => {
            navigate("/dashboard");
        },
        onError: (error) => {
            console.error("Signin failed:", error);
        },
    });
}
