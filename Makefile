SITE_DIR = site
TERRAFORM_DIR = terraform

all: deploy

install:
	cd $(SITE_DIR) && npm install

# Entry point: run the site locally
run: install
	cd $(SITE_DIR) && npm run dev

test: install
	cd $(SITE_DIR) && npm test

screenshots: install
	cd $(SITE_DIR) && npm run screenshots

deploy:
	cd $(SITE_DIR) && npm run build
	cd $(TERRAFORM_DIR) && terraform apply -auto-approve

help:
	@echo "install     - npm install in site/"
	@echo "run         - run site dev server"
	@echo "test        - run site unit test suite (vitest)"
	@echo "screenshots - capture Playwright screenshots (needs browser deps)"
	@echo "deploy      - build and apply terraform"
	@echo "all         - alias for deploy"

.PHONY: run help screenshots
