# 🌐 Catalyst Rate Limiter

A configurable **rate limiter middleware** for your APIs, built with the Zoho Catalyst Cache service using  **Token Bucket Algorithm**.

✅ Works seamlessly with Express.js  
✅ Uses Catalyst Cache segments (you configure the segment name)  
✅ Ready to plug into your projects   

---

## 📦 Installation (from npm)

Install directly from npm:

```bash
npm install catalyst-rate-limiter
```
---

## 🚀 Usage

```js
const express = require('express');
const createRateLimiter = require('catalyst-rate-limiter');

const app = express();

const rateLimiter = createRateLimiter({
  segmentName: 'mySegmentName', // ✅ REQUIRED: Catalyst Cache segment name
  maxTokens: 15,                // optional
  refillInterval: 60000,        // optional
  refillRate: 15,               // optional
  cacheTTL: 1                   // optional
});

app.get('/api/data', rateLimiter, (req, res) => {
  res.json({ message: 'Rate limited route!' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `segmentName` | string | _none_ | **Required.** Catalyst Cache segment name you have configured. |
| `maxTokens` | number | 15 | Maximum tokens available at any time. |
| `refillInterval` | number (ms) | 60000 | Interval in milliseconds after which tokens refill. |
| `refillRate` | number | 15 | Number of tokens to add each refill interval. |
| `cacheTTL` | number | 1 | TTL in minutes for Catalyst cache entries. |

---

## 📄 License

MIT License – use freely in private or commercial projects.

---

**MADE IN MADRAS ❤️**
