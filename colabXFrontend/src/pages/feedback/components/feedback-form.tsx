import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquarePlus, Star } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function FeedbackForm() {
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1000);
    };

    if (isSuccess) {
        return (
            <Card className="max-w-2xl mx-auto text-center py-12">
                <CardContent className="space-y-4 flex flex-col items-center">
                    <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-full mb-4">
                        <MessageSquarePlus className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">Thank you for your feedback!</CardTitle>
                    <p className="text-muted-foreground w-3/4 mx-auto">
                        Your input helps us improve CollabX for everyone. Our product team reviews all suggestions carefully.
                    </p>
                    <Button onClick={() => setIsSuccess(false)} variant="outline" className="mt-4">
                        Submit another response
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto shadow-sm">
            <CardHeader className="text-center pb-8 pt-8">
                <div className="mx-auto w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full mb-4">
                    <MessageSquarePlus className="text-primary w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-bold">Help us improve</CardTitle>
                <CardDescription className="text-base mt-2">
                    Share your thoughts, report bugs, or request new features.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-base">What kind of feedback do you have?</Label>
                        <Select required defaultValue="suggestion">
                            <SelectTrigger>
                                <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="suggestion">General Suggestion</SelectItem>
                                <SelectItem value="feature">Feature Request</SelectItem>
                                <SelectItem value="bug">Bug Report</SelectItem>
                                <SelectItem value="ui">Design Feedback</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-base">How would you rate your overall experience?</Label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                >
                                    <Star
                                        className={cn(
                                            "w-8 h-8 transition-colors",
                                            (hoverRating || rating) >= star
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-muted-foreground/30 hover:text-muted-foreground/50"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Summary</Label>
                        <Input
                            id="title"
                            placeholder="E.g., Navigation feels slow on mobile"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="details">Details</Label>
                        <Textarea
                            id="details"
                            placeholder="Please provide any relevant details, context, or steps to reproduce..."
                            className="min-h-[120px]"
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-6 bg-muted/10 rounded-b-xl flex justify-end">
                    <Button type="submit" disabled={isSubmitting || rating === 0} className="w-full sm:w-auto px-8">
                        {isSubmitting ? "Submitting..." : "Send Feedback"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
