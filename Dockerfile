# Stage 1: 使用官方 Node.js 作为构建环境
FROM node:alpine
WORKDIR /app

# VOLUME指令创建了一个名为/app的挂载点，它将与主机上的一个目录进行关联
# VOLUME [ "/app" ]

# 复制 package.json 和 pnpm-lock.yaml 文件到工作目录
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装项目依赖
RUN pnpm install

# 将项目源代码复制到工作目录
COPY . .

# 构建项目，假设所有的源代码都在 src 目录下
RUN pnpm build

# Stage 2: 生产环境
# FROM node:alpine
# WORKDIR /app

# # 再次安装 pnpm
# RUN npm install -g pnpm

# # # 从构建阶段复制构建结果到当前工作目录
# COPY --from=builder /app/next.config.js ./
# COPY --from=builder /app/public ./public
# # 确保复制的路径匹配构建输出的路径
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json

# # 设置环境变量以便于运行 Next.js 应用
# ENV NEXT_TELEMETRY_DISABLED 1

# 暴露端口（Next.js 默认端口为 3000）
EXPOSE 8093

# 使用 pnpm start 来启动应用
CMD ["pnpm", "start"]