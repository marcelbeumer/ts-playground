# -----
# Build
# -----
FROM node:18-alpine as build
WORKDIR /build

COPY package*.json ./
RUN npm install

COPY . .
RUN mkdir /app
RUN cp package*.json /app
RUN cp ./LICENCE /app

RUN NODE_ENV=production npm run build
RUN cp -r build /app

# ----
# Prod
# ----
FROM node:18-alpine as prod
ENV NODE_ENV production

WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm ci --only=production

COPY --from=build /app .
CMD ["node", "build/index.js"]
