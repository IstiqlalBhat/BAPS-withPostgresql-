export interface Element {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    properties: Record<string, any>;
    bimMetadata?: {
        revitId?: string;
        familyName?: string;
        typeName?: string;
        level?: string;
    };
    projectId: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateElementRequest {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    properties?: Record<string, any>;
    bimMetadata?: Element['bimMetadata'];
}

export interface Pricing {
    id: string;
    elementId: string;
    unitPrice: number;
    totalPrice: number;
    currency: string;
    aiSuggested?: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PricingSuggestion {
    suggestedPrice: number;
    priceRange: {
        min: number;
        max: number;
    };
    confidence: number;
    reasoning: string;
}
