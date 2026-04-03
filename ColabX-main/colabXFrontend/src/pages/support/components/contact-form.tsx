import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LifeBuoy, Send } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from 'react';

export function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate network request
        setTimeout(() => setIsSubmitting(false), 800);
    };

    return (
        <Card className="sticky top-6">
            <CardHeader className="border-b bg-muted/20 pb-6">
                <CardTitle className="text-xl flex items-center gap-2">
                    <LifeBuoy className="h-5 w-5 text-blue-500" />
                    Contact Support
                </CardTitle>
                <CardDescription>
                    Can't find the answer you're looking for? Open a ticket directly with our 24/7 success team.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="Brief summary of your issue..." required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select required defaultValue="technical">
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General Inquiry</SelectItem>
                                    <SelectItem value="technical">Technical Support</SelectItem>
                                    <SelectItem value="billing">Billing</SelectItem>
                                    <SelectItem value="partners">Partner Management</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select required defaultValue="normal">
                                <SelectTrigger id="priority">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent" className="text-destructive">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Detailed Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Please provide as much context as possible so our team can help you efficiently..."
                            className="min-h-[150px] resize-y"
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 bg-muted/20">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                            "Submitting Ticket..."
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" /> Ensure Support
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
