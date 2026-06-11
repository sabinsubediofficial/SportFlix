export interface IptvChannel {
    id: string;
    name: string;
    logo: string | null;
    categories: string[];
}
export declare const fetchIptvApiChannels: () => Promise<any[] | null>;
export declare const fetchIptvApiStreams: () => Promise<any[] | null>;
export declare const fetchIptvApiLogos: () => Promise<any[] | null>;
export declare const fetchIptvApiGuides: () => Promise<any[] | null>;
export declare const getPopularityScore: (name: string) => number;
export declare const getSportsChannels: (limit?: number, query?: string) => Promise<any[]>;
//# sourceMappingURL=iptvApiService.d.ts.map