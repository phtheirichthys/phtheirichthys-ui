FROM caddy as production-stage
RUN mkdir /app
COPY Caddyfile /etc/caddy/Caddyfile
COPY ./dist /usr/share/caddy/
