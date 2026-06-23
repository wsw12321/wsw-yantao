# wsw-yantao

这是一个 Astro 5 网站项目，使用 Cloudflare adapter、Wrangler 和本地 D1 数据库进行开发。

## 本次新增的开发环境配置

项目已加入 Docker 化开发配置，目标是让 Node、pnpm、Astro、Wrangler 等运行环境在不同机器上保持一致。

新增或调整的文件：

- `Dockerfile.dev`：开发镜像，基于 Node 24，固定使用 `pnpm@10.34.4`。
- `docker-compose.yml`：通用 Docker Compose 开发入口，启动 Astro dev server。
- `.devcontainer/devcontainer.json`：VS Code Dev Container 配置，复用同一个 Compose 服务。
- `.dockerignore`：减少 Docker build 上下文。
- `.gitignore`：忽略可能生成的 `.pnpm-store/`。
- `pnpm-workspace.yaml`：允许 `sharp` 执行安装脚本，避免 pnpm 安装依赖失败。

## 使用 Docker Compose 开发

首次构建并启动开发容器：

```sh
docker compose up -d --build
```

访问网站：

```text
http://localhost:4321
```

查看日志：

```sh
docker compose logs -f app
```

停止容器：

```sh
docker compose down
```

在同一容器环境中执行一次性命令：

```sh
docker compose run --rm app pnpm build
docker compose run --rm app pnpm astro -- --help
docker compose run --rm app pnpm wrangler --help
```

`docker compose up` 启动时会自动执行 `pnpm install --frozen-lockfile`。`node_modules` 和 pnpm store 都保存在 Docker named volume 中，不会和宿主机依赖互相污染。

## 本地 D1 数据库

项目依赖 Cloudflare D1，绑定名为 `DB`，配置位于 `wrangler.toml`。

初始化或重置本地 D1 表结构：

```sh
docker compose run --rm app pnpm wrangler d1 execute wsw-yantao-db --local --file=schema.sql
```

Wrangler 的本地 D1 状态会生成在 `.wrangler/` 下，该目录已被 Git 忽略。

## 使用 VS Code Dev Container

VS Code Dev Container 会复用 `docker-compose.yml` 中的 `app` 服务。

使用步骤：

1. 安装 VS Code 的 Dev Containers 扩展。
2. 用 VS Code 打开本项目。
3. 执行 `Dev Containers: Reopen in Container`。
4. 在容器终端中启动 Astro：

```sh
pnpm dev --host 0.0.0.0
```

VS Code 会转发 `4321` 端口，网站仍然通过下面地址访问：

```text
http://localhost:4321
```

## 包管理器

容器开发流程使用 pnpm，并以 `pnpm-lock.yaml` 和 `pnpm-workspace.yaml` 为准。

常用命令：

```sh
pnpm install --frozen-lockfile
pnpm dev --host 0.0.0.0
pnpm build
pnpm preview --host 0.0.0.0
```

仓库中目前仍保留 `package-lock.json`，但 Docker 开发环境不会使用它。

## 常用维护命令

重新构建开发镜像：

```sh
docker compose build
```

重置依赖 volume 和 pnpm 缓存 volume：

```sh
docker compose down -v
docker compose up -d --build
```

查看当前服务状态：

```sh
docker compose ps
docker compose logs --tail=120 app
```

## 已验证的内容

已验证以下流程可用：

- `docker compose build`
- `pnpm install --frozen-lockfile`
- Astro dev server 在容器内启动并返回 `200 text/html`
- Compose 将容器 `4321` 端口映射到宿主机
- Wrangler 本地 D1 schema 初始化

## 项目结构

```text
/
├── public/
├── src/
│   ├── components/
│   ├── layouts/
│   ├── lib/
│   └── pages/
│       └── api/
├── astro.config.mjs
├── docker-compose.yml
├── Dockerfile.dev
├── schema.sql
└── wrangler.toml
```
