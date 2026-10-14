SITE_DIR = site

.DEFAULT_GOAL := help

setup:
	cd $(SITE_DIR) && npm install

# Entry point: run the site locally
run: setup
	cd $(SITE_DIR) && npm run dev

test: setup
	cd $(SITE_DIR) && npm test

screenshots: setup
	cd $(SITE_DIR) && npm run screenshots

build: setup
	cd $(SITE_DIR) && npm run build

help:
	@echo "setup       - npm install in site/"
	@echo "run         - run site dev server"
	@echo "test        - run site unit test suite (vitest)"
	@echo "screenshots - capture Playwright screenshots (needs browser deps)"
	@echo "build       - production build into site/dist"

.PHONY: setup run test screenshots build help
