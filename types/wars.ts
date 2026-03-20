import type { Country } from "./countries";

export type WarData = {
    id: string;
    name: string;
    startDate: string;
    endDate?: string;
    sides: {
        name: string;
        color: string;
        partiesInvolvedIds: number[];
        supportersIds: number[];
    }[];
}

export type War = {
    id: string;
    name: string;
    startDate: string;
    endDate?: string;
    sides: {
        name: string;
        color: string;
        partiesInvolvedI: Country[];
        supportersI: Country[];
    }[];
}