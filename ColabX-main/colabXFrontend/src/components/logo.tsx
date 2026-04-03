import { cn } from "@/lib/utils";
import React from "react";

type LogoProps = React.SVGProps<SVGSVGElement>;

export const Logo = ({ className, ...props }: LogoProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 1000"
            className={cn("h-10 w-10 text-[#006239]", className)}
            fill="currentColor"
            {...props}
        >
            <path
                d="M 777.50472,17.329954 518.94199,326.02244 636.4344,475.63575 997.42769,15.760218 Z M 132.10332,163.6529 393.81197,485.61752 8.2917807,984.7805 238.11733,985.52016 621.75003,490.85392 365.6708,163.6529 Z m 501.02063,344.0666 -105.44933,134.31154 159.86394,186.7035 197.05771,-14.03305 z"
            />
        </svg>
    );
};
