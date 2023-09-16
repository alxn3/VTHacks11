export interface PageLoad {
    (input: {
        params: any;
        url: URL;
    }): Promise<{ props: PageData } | { status: number; body: string }>;
}

export interface PageData {
    post: {
        title: string;
        content: string;
    };
}