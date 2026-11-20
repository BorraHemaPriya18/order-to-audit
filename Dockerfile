FROM node:24-alpine
WORKDIR /app
COPY package.json seed.js server.js domain.js start.js sw.js manifest.webmanifest ./
RUN mkdir -p /data && chown -R node:node /app /data
USER node
ENV DB_PATH=/data/data.sqlite PORT=3000
EXPOSE 3000
CMD ["node", "start.js"]
