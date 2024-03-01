# Use the official Redis image as a base
FROM redis/redis-stack:latest

# Copy the custom redis.conf file into the image
COPY redis.conf /usr/local/etc/redis/redis.conf
