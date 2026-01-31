import { useMutation } from "@tanstack/react-query";
import { signupUser } from "@/services/authservices";

export function useSignupMutation() {
    return useMutation({
        mutationFn: signupUser,
        onSuccess: (data) => {
            console.log("Signup successful:", data);
            // TODO: Redirect to dashboard or login page
        },
        onError: (error) => {
            console.error("Signup failed:", error);
        },
    });
}
