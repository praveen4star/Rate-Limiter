
export interface RateLimiterStrategy {
    execute(): boolean;   
    getBucket(): number; 
}