import { SupportHeader } from './components/support-header';
import { FaqAndDocs } from './components/faq-accordion';
import { ContactForm } from './components/contact-form';
import { mockFaqs, mockDocLinks } from '@/lib/mock-support';

export default function SupportPage() {
    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
            <SupportHeader />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    {/* Left Column: Self Serve Info */}
                    <FaqAndDocs faqs={mockFaqs} docs={mockDocLinks} />
                </div>

                <div className="lg:col-span-1">
                    {/* Right Column: Direct Help Ticket */}
                    <ContactForm />
                </div>
            </div>
        </div>
    );
}
