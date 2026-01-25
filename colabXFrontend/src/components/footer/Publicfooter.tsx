import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter } from "lucide-react";

function Publicfooter() {
    return (
        <footer className="bg-background-alt border-t border-border mt-auto">
            <div className="container mx-auto px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

                    {/* 1. Brand Column */}
                    <div className="flex flex-col gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="font-bold text-2xl tracking-tight">
                                Colab<span className="text-primary">X</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Centralized partnership & collaboration management for modern startups.
                        </p>
                    </div>

                    {/* 2. Product Column */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-foreground">Product</h3>
                        <div className="flex flex-col gap-2">
                            <FooterLink to="/overview">Overview</FooterLink>
                            <FooterLink to="/features">Features</FooterLink>
                            <FooterLink to="/solutions">Solutions</FooterLink>
                            <FooterLink to="/pricing">Pricing</FooterLink>
                            <FooterLink to="/security">Security</FooterLink>
                        </div>
                    </div>

                    {/* 3. Resources Column */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-foreground">Resources</h3>
                        <div className="flex flex-col gap-2">
                            <FooterLink to="/docs">Documentation</FooterLink>
                            <FooterLink to="/blog">Blog</FooterLink>
                            <FooterLink to="/faqs">FAQs</FooterLink>
                            <FooterLink to="/case-studies">Case Studies</FooterLink>
                        </div>
                    </div>

                    {/* 4. Legal & Compliance Column */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-foreground">Legal</h3>
                        <div className="flex flex-col gap-2">
                            <FooterLink to="/terms">Terms of Service</FooterLink>
                            <FooterLink to="/privacy">Privacy Policy</FooterLink>
                            <FooterLink to="/cookie-policy">Cookie Policy</FooterLink>
                            <FooterLink to="/data-protection">Data Protection</FooterLink>
                            <FooterLink to="/compliance">Compliance & Audit</FooterLink>
                        </div>
                    </div>

                    {/* 5. Social / Contact Column */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-foreground">Contact</h3>
                        <div className="flex flex-col gap-2">
                            <FooterLink to="/contact">Contact Us</FooterLink>
                            <a href="mailto:support@colabx.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                Support Email
                            </a>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <SocialIcon href="https://linkedin.com" icon={<Linkedin size={20} />} label="LinkedIn" />
                            <SocialIcon href="https://twitter.com" icon={<Twitter size={20} />} label="Twitter" />
                            <SocialIcon href="https://github.com" icon={<Github size={20} />} label="GitHub" />
                        </div>
                    </div>
                </div>

                <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} ColabX. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
    return (
        <Link
            to={to}
            className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
            {children}
        </Link>
    );
}

function SocialIcon({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label={label}
        >
            {icon}
        </a>
    );
}

export default Publicfooter;
