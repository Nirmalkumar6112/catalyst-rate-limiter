// index.js
const catalyst = require('zcatalyst-sdk-node');

// Configurable defaults
const DEFAULT_MAX_TOKENS = 15;
const DEFAULT_REFILL_INTERVAL = 60 * 1000;
const DEFAULT_REFILL_RATE = 15;
const DEFAULT_CACHE_TTL = 1;

/**
 * Create a rate limiter middleware
 * @param {Object} options
 * @param {string} options.segmentName  <-- REQUIRED: Catalyst cache segment name
 * @param {number} [options.maxTokens]
 * @param {number} [options.refillInterval] (ms)
 * @param {number} [options.refillRate]
 * @param {number} [options.cacheTTL] (minutes)
 */
function createRateLimiter(options = {}) {
  const {
    segmentName,
    maxTokens = DEFAULT_MAX_TOKENS,
    refillInterval = DEFAULT_REFILL_INTERVAL,
    refillRate = DEFAULT_REFILL_RATE,
    cacheTTL = DEFAULT_CACHE_TTL
  } = options;

  if (!segmentName || typeof segmentName !== 'string') {
    throw new Error('segmentName is required and must be a string.');
  }

  return async (req, res, next) => {
    const app = catalyst.initialize(req);

    const ip =
      req.headers['x-forwarded-for']?.split(',').shift() ||
      req.socket?.remoteAddress ||
      req.ip;

    const cache = app.cache();
    const segment = cache.segment(segmentName); // ✅ user‑configured segment
    const userKey = ip;

    try {
      const cachedData = await segment.get(userKey);
      const now = new Date();

      let tokens = maxTokens;
      let lastRefill = now;

      if (cachedData && cachedData.cache_value) {
        const parsed = JSON.parse(cachedData.cache_value);
        tokens = parsed.tokens;
        lastRefill = new Date(parsed.lastRefill);

        // Refill logic
        const elapsed = now - lastRefill;
        const tokensToAdd = Math.floor(elapsed / refillInterval) * refillRate;
        tokens = Math.min(maxTokens, tokens + tokensToAdd);

        if (tokens > 0) {
          tokens -= 1;
          await segment.update(
            userKey,
            JSON.stringify({ tokens, lastRefill: now }),
            cacheTTL
          );
          return next();
        } else {
          return res
            .status(429)
            .json({ message: 'Too Many Requests. Please wait before retrying.' });
        }
      } else {
        // No record: create one
        await segment.put(
          userKey,
          JSON.stringify({ tokens: maxTokens - 1, lastRefill: now }),
          cacheTTL
        );
        return next();
      }
    } catch (err) {
      console.error('Rate Limiter Error:', err);
      return res.status(500).json({ message: 'Internal rate limit error' });
    }
  };
}

module.exports = createRateLimiter;
