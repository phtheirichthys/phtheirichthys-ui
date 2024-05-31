FROM node:alpine as build-stage

ARG NODE_AUTH_TOKE
ENV NODE_AUTH_TOKEN=${NODE_AUTH_TOKE}

WORKDIR /app
COPY package*.json ./
COPY .npmrc ./
RUN NODE_AUTH_TOKEN=${NODE_AUTH_TOKEN} yarn config set network-timeout 300000
RUN NODE_AUTH_TOKEN=${NODE_AUTH_TOKEN} yarn install
COPY ./ .
RUN NODE_AUTH_TOKEN=${NODE_AUTH_TOKEN} yarn build

FROM caddy as production-stage
RUN mkdir /app
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build-stage /app/dist /usr/share/caddy/
