export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    role?: string;
    created_at?: string;
}

export interface Company {
    id: string;
    name: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    activeCompany?: Company;
    flash?: {
        success?: string;
        error?: string;
    };
};
