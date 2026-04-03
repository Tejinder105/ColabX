import { Link } from "react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  BookOpen,
  Handshake,
  Target,
  ShieldCheck,
  Rocket,
  Zap,
  Briefcase,
  Building2,
  Globe,
  Phone,
  Laptop,
  Mail,
} from "lucide-react";
import { Button } from "../ui/button";
import { Logo } from "../logo";

const productComponents: {
  title: string;
  href: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    title: "How CollabX Works",
    href: "/how-it-works",
    description: "Learn about our platform and how it can help you.",
    icon: BookOpen,
  },
  {
    title: "Partner Management",
    href: "/partners",
    description: "Manage your partnerships efficiently.",
    icon: Handshake,
  },
  {
    title: "OKRs & Performance",
    href: "/okrs",
    description: "Track objectives and key results.",
    icon: Target,
  },
  {
    title: "Audit & Compliance",
    href: "/audit",
    description: "Ensure compliance with automated audits.",
    icon: ShieldCheck,
  },
];

const solutions: {
  title: string;
  href: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    title: "For Startups",
    href: "/solutions/startups",
    description: "Tailored for startups.",
    icon: Rocket,
  },
  {
    title: "For Accelerators",
    href: "/solutions/accelerators",
    description: "Optimized for accelerators.",
    icon: Zap,
  },
  {
    title: "For Investors",
    href: "/solutions/investors",
    description: "Insights for investors.",
    icon: Briefcase,
  },
  {
    title: "For Agencies",
    href: "/solutions/agencies",
    description: "Tools for agencies.",
    icon: Building2,
  },
  {
    title: "For Enterprises",
    href: "/solutions/enterprises",
    description: "Scalable enterprise solutions.",
    icon: Globe,
  },
];

const contact: {
  title: string;
  href: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    title: "Contact Sales",
    href: "/contact/sales",
    description: "Talk to our sales team.",
    icon: Phone,
  },
  {
    title: "Request Demo",
    href: "/contact/demo",
    description: "See CollabX in action.",
    icon: Laptop,
  },
  {
    title: "Support Email",
    href: "/contact/support",
    description: "Get help when you need it.",
    icon: Mail,
  },
];

function NavMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-white px-2 text-xs h-7">
            Product
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 md:w-[400px] lg:w-[600px] lg:grid-cols-[.75fr_1fr]  rounded-xl">
              <div className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-neutral-800 to-neutral-900 p-6 no-underline outline-none focus:shadow-md border border-neutral-700 hover:border-neutral-600 transition-colors"
                    to="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium text-white">
                      Overview
                    </div>
                    <p className="text-sm leading-tight text-neutral-400">
                      A unified platform to manage all your collaborative needs
                      seamlessly.
                    </p>
                  </Link>
                </NavigationMenuLink>
              </div>
              <div className="flex flex-col gap-2">
                {productComponents.map((component) => (
                  <NavigationMenuLink key={component.title} asChild>
                    <Link
                      to={component.href}
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-neutral-800 hover:text-accent-foreground focus:bg-neutral-800 focus:text-accent-foreground group"
                    >
                      <div className="text-sm font-medium leading-none text-neutral-200 group-hover:text-white transition-colors flex items-center gap-2">
                        <component.icon className="h-4 w-4" />
                        {component.title}
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-neutral-500 group-hover:text-neutral-400">
                        {component.description}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-white px-2 text-xs h-7">
            Solutions
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {solutions.map((item) => (
                <ListItem
                  key={item.title}
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                >
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              to="/pricing"
              className="group inline-flex h-7 w-max items-center justify-center rounded-md px-2 text-xs font-semibold text-white hover:text-accent-foreground focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1"
            >
              Pricing
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-white px-2 text-xs h-7">
            Contact
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {contact.map((item) => (
                <ListItem
                  key={item.title}
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                >
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = ({
  title,
  href,
  children,
  icon: Icon,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
  icon: React.ElementType;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-neutral-800 hover:text-accent-foreground focus:bg-neutral-800 focus:text-accent-foreground group"
        >
          <div className="text-sm font-medium leading-none text-neutral-200 group-hover:text-white transition-colors flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-neutral-500 group-hover:text-neutral-400">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

function Publicheader() {
  return (
    <div className="w-full h-16 flex items-center justify-between px-12 border-b border-white/5 sticky top-0 z-50 bg-background/70 backdrop-blur-xl shadow-sm">
      <div className="flex gap-4">
        <Link to="/">
          <h1 className="flex items-center text-2xl font-bold text-white">
            Colab
            <span>
              <Logo className="h-8 w-8" />
            </span>
          </h1>
        </Link>
        <NavMenu />
      </div>
      <div className="gap-4 flex">
        <Link to="/auth/login">
          <Button variant="outline">Login</Button>
        </Link>
        <Link to="/auth/signup">
          <Button>Sign Up</Button>
        </Link>
      </div>
    </div>
  );
}

export default Publicheader;
