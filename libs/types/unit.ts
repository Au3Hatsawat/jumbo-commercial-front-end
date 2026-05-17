export interface Unit {
    id: number;
    nameTh: string;
    nameEn: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UnitCreatePayload {
    nameTh: string;
    nameEn: string;
}

export interface UnitUpdatePayload extends Partial<UnitCreatePayload> {
    id: number;
}