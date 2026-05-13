FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Đảm bảo file proto được copy vào dist (nếu nest-cli.json không tự làm)
COPY src/demo.proto ./dist/

EXPOSE 3000 50051

CMD ["node", "dist/main"]
