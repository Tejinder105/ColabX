import type { FaqItem, DocLink } from '@/types/support';

export const mockFaqs: FaqItem[] = [
    {
        id: "faq-1",
        category: "General",
        question: "How do I switch between my organization and partner views?",
        answer: "You can toggle the context using the workspace switcher located in the top-right corner next to your user profile picture."
    },
    {
        id: "faq-2",
        category: "Partnerships",
        question: "How are Deal stages calculated in the pipeline?",
        answer: "Deal stages are manually advanced by the assigned Team Lead. Tracking activity automatically triggers timestamp updates within the Deal Details sheet."
    },
    {
        id: "faq-3",
        category: "Account",
        question: "I forgot my password, how do I reset it?",
        answer: "Click the 'Forgot Password' link on the login screen. A reset link will be sent to your registered email address."
    },
    {
        id: "faq-4",
        category: "Technical",
        question: "Is there an API available for integrating custom CRM tools?",
        answer: "Yes, our Developer API is available for Enterprise users. You can find the API Documentation link in the 'Documentation' section above."
    },
    {
        id: "faq-5",
        category: "Account",
        question: "How do I update my profile picture?",
        answer: "Go to Organization Settings -> My Profile. Click on your current avatar to upload a new image."
    }
];

export const mockDocLinks: DocLink[] = [
    {
        id: "doc-1",
        title: "Getting Started Guide",
        description: "Learn the basics of navigating the platform and setting up your first partner.",
        readTime: "5 min read"
    },
    {
        id: "doc-2",
        title: "Deal Pipeline Best Practices",
        description: "Discover strategies for moving deals efficiently from Lead to Won.",
        readTime: "8 min read"
    },
    {
        id: "doc-3",
        title: "Managing User Permissions",
        description: "Understand the differences between Admin, Manager, and Partner roles.",
        readTime: "4 min read"
    },
    {
        id: "doc-4",
        title: "Developer API Reference",
        description: "Technical documentation for building custom integrations.",
        readTime: "15 min read"
    }
];
