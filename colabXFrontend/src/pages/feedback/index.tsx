import { FeedbackForm } from './components/feedback-form';

export default function FeedbackPage() {
    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-10 w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start bg-slate-50/50 dark:bg-transparent">
            <div className="w-full max-w-2xl px-4">
                <FeedbackForm />
            </div>
        </div>
    );
}
