export interface Category {
    id: number;
    nameTh: string;
    nameEn: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CategoryCreatePayload {
    nameTh: string;
    nameEn: string;
}

export interface CategoryUpdatePayload extends Partial<CategoryCreatePayload> {
    id: number;
}