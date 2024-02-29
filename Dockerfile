FROM node:18-alpine

RUN apk add --no-cache libc6-compat

ENV NODE_ENV production
USER node
WORKDIR /app
COPY --chown=node package*.json .
RUN npm ci
COPY --chown=node . .
RUN npm run build

EXPOSE 3000

ENV PORT 3000

CMD ["yarn", "start"]
