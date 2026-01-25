import {
    FileText,
    Target,
    ListTodo,
    BarChart,
    ShieldCheck,
    UserPlus,
} from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const features = [
    {
        Icon: UserPlus,
        name: "Partner Onboarding",
        description: "Streamline the partner intake process with automated workflows.",
        href: "/partners",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-1",
        background: (
            <div className="absolute top-10 left-10 opacity-40 group-hover:opacity-60 transition-opacity">
                <UserPlus className="w-24 h-24 text-primary/50" />
            </div>
        ),
    },
    {
        Icon: FileText,
        name: "Agreements & MoUs",
        description: "Securely store and manage all your partnership agreements.",
        href: "/agreements",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-2",
        background: (
            <div className="absolute top-10 right-10 opacity-40 group-hover:opacity-60 transition-opacity">
                <FileText className="w-32 h-32 text-primary/50" />
            </div>
        ),
    },
    {
        Icon: Target,
        name: "Goals & OKRs",
        description: "Align partner activities with clear objectives and key results.",
        href: "/goals",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-2",
        background: (
            <div className="absolute top-0 right-0 opacity-40 group-hover:opacity-60 transition-opacity">
                <Target className="w-32 h-32 text-primary/50" />
            </div>
        ),
    },
    {
        Icon: ListTodo,
        name: "Task Management",
        description: "Assign and track initiatives to ensure accountability.",
        href: "/tasks",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-1",
        background: (
            <div className="absolute bottom-10 left-10 opacity-40 group-hover:opacity-60 transition-opacity">
                <ListTodo className="w-24 h-24 text-primary/50" />
            </div>
        ),
    },
    {
        Icon: BarChart,
        name: "KPI Reports",
        description: "Real-time performance metrics to drive decision making.",
        href: "/reports",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-1",
        background: (
            <div className="absolute top-10 left-10 opacity-40 group-hover:opacity-60 transition-opacity">
                <BarChart className="w-24 h-24 text-primary/50" />
            </div>
        ),
    },
    {
        Icon: ShieldCheck,
        name: "Audit Logs",
        description: "Full compliance tracking with detailed activity logs.",
        href: "/compliance",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-2",
        background: (
            <div className="absolute top-10 right-10 opacity-40 group-hover:opacity-60 transition-opacity">
                <ShieldCheck className="w-32 h-32 text-primary/50" />
            </div>
        ),
    },
];

export function CoreFeatures() {
    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Everything you need to scale partnerships
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-muted-foreground">
                        From onboarding to compliance, ColabX provides a comprehensive suite of tools to manage your entire partnership lifecycle.
                    </p>
                </div>
                <BentoGrid>
                    {features.map((feature, idx) => (
                        <BentoCard key={idx} {...feature} />
                    ))}
                </BentoGrid>
            </div>
        </div>
    );
}
