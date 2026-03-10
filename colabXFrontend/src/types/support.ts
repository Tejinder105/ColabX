export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    category: 'General' | 'Account' | 'Partnerships' | 'Technical';
}

export interface DocLink {
    id: string;
    title: string;
    description: string;
    iconUrl?: string;
    readTime: string;
}
