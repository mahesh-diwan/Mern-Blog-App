FROM node:18-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json .
RUN npm ci --legacy-peer-deps

# Copy everything else
COPY . .

EXPOSE 3000

# We'll override these in docker-compose or AWS ECS, 
# but these are good defaults for local dev.
ENV NODE_ENV=production

CMD ["npm", "start"]