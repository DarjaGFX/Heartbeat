FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install yarn
RUN rm -rf node_modules
COPY . .
RUN yarn install
RUN yarn run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]