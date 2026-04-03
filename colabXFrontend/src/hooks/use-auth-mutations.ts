import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signupUser, signinUser } from "@/services/authservices";
import { useAuthStore } from "@/stores/authStore";

export function useSignupMutation() {
    const navigate = useNavigate();
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: signupUser,
        onSuccess: () => {
            clearAuth();
            queryClient.clear();
            navigate("/onboarding");
        },
        onError: (error) => {
            console.error("Signup failed:", error);
        },
    });
}

export function useSigninMutation() {
    const navigate = useNavigate();
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: signinUser,
        onSuccess: () => {
            clearAuth();
            queryClient.clear();
            navigate("/dashboard");
        },
        onError: (error) => {
            console.error("Signin failed:", error);
        },
    });
}
