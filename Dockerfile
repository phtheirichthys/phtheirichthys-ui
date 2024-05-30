FROM node:alpine as build-stage

ARG NODE_AUTH_TOKEN

WORKDIR /app
COPY package*.json ./
COPY .npmrc ./
RUN yarn config set network-timeout 300000
RUN yarn install
COPY ./ .
RUN yarn build

FROM caddy as production-stage
RUN mkdir /app
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build-stage /app/dist /usr/share/caddy/
