import { signUp, signIn } from "@/utils/auth-client";

export interface SignupData {
    email: string;
    username: string;
    password: string;
}

export interface SigninData {
    email: string;
    password: string;
}

export async function signupUser(data: SignupData) {
    const response = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.username,
    });

    if (response.error) {
        throw new Error(response.error.message || "Signup failed");
    }

    return response.data;
}

export async function signinUser(data: SigninData) {
    const response = await signIn.email({
        email: data.email,
        password: data.password,
    });

    if (response.error) {
        throw new Error(response.error.message || "Signin failed");
    }

    return response.data;
}

export async function googleSignIn() {
    try {
        const result = await signIn.social({
            provider: "google",
            callbackURL: "http://localhost:5173/dashboard",
        });
        console.log("Google sign-in result:", result);
        if (result.error) {
            console.error("Google sign-in error:", result.error);
        }
    } catch (error) {
        console.error("Google sign-in exception:", error);
    }
}
