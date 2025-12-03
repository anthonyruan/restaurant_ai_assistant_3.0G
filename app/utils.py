import time
import functools

def ttl_cache(ttl_seconds):
    def decorator(func):
        cache = {}
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            # Convert args and kwargs to a string representation to be hashable
            key = str(args) + str(kwargs)
            if key in cache:
                value, timestamp = cache[key]
                elapsed = now - timestamp
                if elapsed < ttl_seconds:
                    # print(f"📦 Using cached result for {func.__name__} — {ttl_seconds - elapsed:.0f}s remaining")
                    return value
            result = func(*args, **kwargs)
            cache[key] = (result, now)
            # print(f"🆕 Cache updated for {func.__name__}")
            return result
        return wrapper
    return decorator
