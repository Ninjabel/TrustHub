// Simple in-memory rate limiter
// For production, use Redis or a dedicated rate limiting service

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per minute

export function checkRateLimit(identifier: string): {
  success: boolean
  limit: number
  remaining: number
  reset: number
} {
  const now = Date.now()
  const record = store[identifier]

  // Clean up old entries
  if (record && record.resetTime < now) {
    delete store[identifier]
  }

  // Initialize or get current record
  const current = store[identifier] || {
    count: 0,
    resetTime: now + RATE_LIMIT_WINDOW,
  }

  // Check if limit exceeded
  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      success: false,
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: 0,
      reset: current.resetTime,
    }
  }

  // Increment counter
  current.count++
  store[identifier] = current

  return {
    success: true,
    limit: RATE_LIMIT_MAX_REQUESTS,
    remaining: RATE_LIMIT_MAX_REQUESTS - current.count,
    reset: current.resetTime,
  }
}

// Cleanup interval to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, RATE_LIMIT_WINDOW)
