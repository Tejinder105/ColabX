import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSignupMutation } from "@/hooks/use-auth-mutations";
import { googleSignIn } from "@/services/authservices";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { getAppBaseUrl } from "@/lib/api";

type InviteInputs = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

interface InvitationData {
  email: string;
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function InviteForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("invite");
  const [inviteData, setInviteData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setActiveOrg = useAuthStore((state) => state.setActiveOrg);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<InviteInputs>({
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signupMutation = useSignupMutation();

  // Validate invitation token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("No invitation token provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/invite/${token}`, {
          method: "GET",
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Invalid or expired invitation");
          setLoading(false);
          return;
        }

        const data = await response.json();
        setInviteData(data.invitation);
        setValue("email", data.invitation.email);
        setLoading(false);
      } catch (err) {
        console.error("Failed to validate invitation:", err);
        setError("Failed to validate invitation. Please try again.");
        setLoading(false);
      }
    };

    validateToken();
  }, [token, setValue]);

  const handleGoogleSignIn = () => {
    if (token) {
      sessionStorage.setItem("inviteToken", token);
      googleSignIn(`${getAppBaseUrl()}/onboarding?invite=${encodeURIComponent(token)}`);
      return;
    }
    googleSignIn();
  };

  const onSubmit: SubmitHandler<InviteInputs> = (data) => {
    if (!token) {
      setError("Invitation token missing");
      return;
    }
    // Pass the invite token in signup mutation
    signupMutation.mutate(
      {
        email: data.email,
        username: data.username,
        password: data.password,
      },
      {
        onSuccess: async () => {
          // After signup, accept the invitation
          try {
            const acceptResponse = await fetch(
              `${API_BASE}/api/invite/${token}/accept`,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (acceptResponse.ok) {
              const result = await acceptResponse.json();
              // Set the newly joined organization as active
              if (result.organization && inviteData) {
                setActiveOrg({
                  id: result.organization.id,
                  name: result.organization.name,
                  slug: result.organization.slug,
                  role: inviteData.role,
                  joinedAt: new Date().toISOString(),
                });
              }
              // Navigate to dashboard
              navigate("/dashboard");
            } else {
              const errorData = await acceptResponse.json();
              console.error("Failed to accept invitation:", errorData);
              navigate("/dashboard");
            }
          } catch (err) {
            console.error("Error accepting invitation:", err);
            navigate("/dashboard");
          }
        },
      }
    );
  };

  if (loading) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-8 flex items-center justify-center min-h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-8 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h2 className="font-semibold text-destructive">
                    Invalid Invitation
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error || "This invitation is no longer valid."}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/auth/signup")}
                className="w-full"
              >
                Create Account Instead
              </Button>
              <Button
                onClick={() => navigate("/auth/login")}
                variant="outline"
                className="w-full"
              >
                Sign In
              </Button>
            </div>
            <div className="bg-muted relative hidden md:block">
              <img
                src="/auth-illustration.png"
                alt="ColabX Authentication Illustration"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center mb-2">
                <h1 className="text-2xl font-bold">Join {inviteData.organization.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Create your account to join as a {inviteData.role}
                </p>
              </div>

              {signupMutation.isError && (
                <div className="rounded-md bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">
                    {signupMutation.error?.message ||
                      "Signup failed. Please try again."}
                  </p>
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  required
                  {...register("username", {
                    required: "Username is required",
                    minLength: {
                      value: 3,
                      message: "Username must be at least 3 characters long",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: "Username can only contain letters, numbers, and underscores",
                    },
                  })}
                />
                <FieldError errors={[errors.username]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  disabled
                  {...register("email")}
                />
                <FieldDescription className="text-xs">
                  This email was specified in your invitation
                </FieldDescription>
              </Field>

              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      required
                      placeholder="Enter your password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters long",
                        },
                      })}
                    />
                    <FieldError errors={[errors.password]} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      required
                      placeholder="Confirm password"
                      {...register("confirmPassword", {
                        required: "Confirm Password is required",
                        validate: (value) =>
                          value === getValues("password") ||
                          "Passwords do not match",
                      })}
                    />
                    <FieldError errors={[errors.confirmPassword]} />
                  </Field>
                </Field>
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="w-full"
                >
                  {signupMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account & Join"
                  )}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>

              <Field>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                >
                  <svg
                    width="800px"
                    height="800px"
                    viewBox="-3 0 262 262"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid"
                    className="mr-2 h-4 w-4"
                  >
                    <path
                      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                      fill="#4285F4"
                    />
                    <path
                      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                      fill="#34A853"
                    />
                    <path
                      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                      fill="#FBBC05"
                    />
                    <path
                      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                      fill="#EB4335"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/auth/login")}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/auth-illustration.png"
              alt="ColabX Authentication Illustration"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
