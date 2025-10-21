# Makefile for React Frontend Docker Deployment

.PHONY: help build run stop clean deploy logs shell test

# Variables
IMAGE_NAME = keyprog-frontend
IMAGE_TAG = latest
CONTAINER_NAME = keyprog-frontend
PORT = 3000

help: ## Show this help message
	@echo "React Frontend Docker Commands"
	@echo "==============================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker image
	@echo "🔨 Building Docker image..."
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .
	@echo "✅ Build complete!"

run: ## Run container locally
	@echo "🚀 Starting container..."
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):80 \
		--restart unless-stopped \
		$(IMAGE_NAME):$(IMAGE_TAG)
	@echo "✅ Container started at http://localhost:$(PORT)"

stop: ## Stop and remove container
	@echo "🛑 Stopping container..."
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true
	@echo "✅ Container stopped"

clean: ## Remove images and containers
	@echo "🧹 Cleaning up..."
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true
	docker rmi $(IMAGE_NAME):$(IMAGE_TAG) || true
	docker system prune -f
	@echo "✅ Cleanup complete"

deploy: ## Deploy to production server
	@echo "🚀 Deploying to production..."
	./deploy-docker.sh --yes

logs: ## View container logs
	docker logs -f $(CONTAINER_NAME)

shell: ## Access container shell
	docker exec -it $(CONTAINER_NAME) sh

test: ## Test the deployment
	@echo "🧪 Testing deployment..."
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:$(PORT) || echo "❌ Container not accessible"

ps: ## Show running containers
	docker ps --filter name=$(CONTAINER_NAME)

stats: ## Show container stats
	docker stats $(CONTAINER_NAME) --no-stream

restart: ## Restart container
	@echo "🔄 Restarting container..."
	docker restart $(CONTAINER_NAME)
	@echo "✅ Container restarted"

# Development commands
dev-build: ## Build and run locally
	$(MAKE) build
	$(MAKE) run

dev-rebuild: ## Rebuild without cache
	@echo "🔨 Rebuilding without cache..."
	docker build --no-cache -t $(IMAGE_NAME):$(IMAGE_TAG) .

# Production commands
prod-deploy: ## Full production deployment
	$(MAKE) build
	$(MAKE) deploy

prod-rollback: ## Rollback to previous version (manual)
	@echo "⚠️  Rollback requires manual intervention"
	@echo "Run: ssh digitalocean 'docker ps -a' to see previous versions"
