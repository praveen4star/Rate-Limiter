import { RateLimiterStrategy } from "./RateLimiterStrategy";

/**
 * Token Bucket Strategy
 * required Parameters: bucketCapacity and fillRate (requests per second)
 */
class TokenBucketStrategy implements RateLimiterStrategy {
  private bucketCapacity: number;  
  private fillRate: number; // requests per second
  private lastTimeStamp : number;
  private bucket : number;
  constructor(bucketCapacity: number, fillRate: number) {
    this.bucketCapacity = bucketCapacity;
    this.fillRate = fillRate;
    this.lastTimeStamp = Date.now();
    this.bucket = this.bucketCapacity;
  }
  private fillBucket(){
    const now = Date.now();
    const elapsed = Math.floor((now - this.lastTimeStamp)/1000);
    this.lastTimeStamp = now;
    this.bucket += (elapsed * this.fillRate);
    if (this.bucket > this.bucketCapacity) {
      this.bucket = this.bucketCapacity;
    }
  }
  public execute(): boolean {
    this.fillBucket();
    if(this.bucket >= 1){
        this.bucket -= 1;
        return true;
    }
    return false;
  }
  public getBucket(): number {
    return this.bucket;
  }
}

export default  TokenBucketStrategy;