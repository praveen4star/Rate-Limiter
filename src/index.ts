import express, { Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import TokenBucketStrategy from './strategies/rateLimiter/TokenBucketStrategy';
import { RateLimiterStrategy } from './strategies/rateLimiter/RateLimiterStrategy';
import { rateLimiterConstants } from './constants/ratelimit'
dotenv.config();

const app = express();

const rateLimiters = new Map<string, RateLimiterStrategy>();
const rateLimiterMiddleware = (req: Request, res: Response, next: any) => {
	const ip = req.ip as string;
	if(!rateLimiters.has(ip)){
		rateLimiters.set(ip, new TokenBucketStrategy(rateLimiterConstants.capacity, rateLimiterConstants.fillRate));
	}
	const rateLimiter = rateLimiters.get(ip) as RateLimiterStrategy;
	/** setting the header with rate limiting info  */
	res.setHeader('X-RateLimit-Limit', rateLimiterConstants.capacity.toString());
	if(rateLimiter.execute()){
		res.setHeader('X-RateLimit-Remaining', rateLimiter.getBucket().toString());
		next();
	}
	else{
		res.setHeader('X-RateLimit-Remaining', rateLimiter.getBucket().toString());		
		res.setHeader('Retry-After', rateLimiterConstants.fillRate.toString());
		res.status(429).send({ message: 'Too many requests' });
	}
};



app.use(rateLimiterMiddleware);


app.get('/', (req, res) => {
	res.send({ message: 'Hello World' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
