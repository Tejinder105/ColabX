import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen, FileText } from 'lucide-react';
import type { FaqItem, DocLink } from '@/types/support';

export function FaqAndDocs({ faqs, docs }: { faqs: FaqItem[], docs: DocLink[] }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Platform Documentation
                    </CardTitle>
                    <CardDescription>Comprehensive guides to getting the most out of CollabX.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    {docs.map((doc) => (
                        <a
                            key={doc.id}
                            href="#"
                            className="block group p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 bg-primary/10 p-2 rounded-md">
                                    <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-medium group-hover:text-primary transition-colors">{doc.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                                    <p className="text-xs text-muted-foreground mt-2">{doc.readTime}</p>
                                </div>
                            </div>
                        </a>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
                    <CardDescription>Quick answers to common questions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq) => (
                            <AccordionItem key={faq.id} value={faq.id}>
                                <AccordionTrigger className="text-left hover:text-primary transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-sm w-fit">
                                            {faq.category}
                                        </span>
                                        <span className="font-medium">{faq.question}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed pl-4 sm:pl-[120px]">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
