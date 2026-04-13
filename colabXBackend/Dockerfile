FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm install tsx drizzle-kit
COPY --from=build /app/dist ./dist
COPY drizzle ./drizzle
COPY drizzle.config.ts ./
COPY tsconfig.json ./
COPY src/schemas ./src/schemas
COPY src/partners/partners.schema.ts ./src/partners/partners.schema.ts
COPY src/teams/teams.schema.ts ./src/teams/teams.schema.ts
COPY src/deals/deals.schema.ts ./src/deals/deals.schema.ts
COPY src/okr/okr.schema.ts ./src/okr/okr.schema.ts
COPY src/contacts/contacts.schema.ts ./src/contacts/contacts.schema.ts
COPY src/org/org.constants.ts ./src/org/org.constants.ts
EXPOSE 3000
CMD ["node", "dist/index.js"]
