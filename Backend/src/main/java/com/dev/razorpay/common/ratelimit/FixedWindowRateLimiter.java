package com.dev.razorpay.common.ratelimit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.rate-limit.method", havingValue = "fixed")
public class FixedWindowRateLimiter implements RateLimiter {

    private final StringRedisTemplate redis;

    @Override
    public RateLimitResult check(String key, int maxRequestAllowed, long windowSeconds) {
        try {
            String redisKey = "ratelimit:fixed:" + key;

            Long count = redis.opsForValue().increment(redisKey);

            if (count == null) return RateLimitResult.allowed(maxRequestAllowed);

            if (count == 1) {
                redis.expire(redisKey, Duration.ofSeconds(windowSeconds));
            }

            if (count > maxRequestAllowed) {
                Long ttl = redis.getExpire(redisKey, TimeUnit.SECONDS);
                int retryAfter = (ttl != null && ttl > 0) ? ttl.intValue() : (int) windowSeconds;
                return RateLimitResult.denied(retryAfter);
            }

            return RateLimitResult.allowed((int) (maxRequestAllowed - count));
        } catch (DataAccessException e) {
            // Redis is an optional production dependency. Authentication and
            // checkout should continue when only the distributed limit is down.
            log.warn("Rate limiter unavailable, failing open for key={}", key);
            return RateLimitResult.allowed(maxRequestAllowed);
        }
    }
}
