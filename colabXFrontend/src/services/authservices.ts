import { signUp } from "@/utils/auth-client";

export interface SignupData {
    email: string;
    username: string;
    password: string;
}

export async function signupUser(data: SignupData) {
    const response = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.username, // Better Auth uses 'name' field
    });

    if (response.error) {
        throw new Error(response.error.message || "Signup failed");
    }

    return response.data;
}
