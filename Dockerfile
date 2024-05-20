FROM node:20.9.0

WORKDIR /app

COPY tsconfig.json config.json package.json package-lock.json ./

RUN npm ci

COPY . ./

RUN npm run build

CMD node './dist/src/index.js' start