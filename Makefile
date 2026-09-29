SITE_DIR = site

install:
	cd $(SITE_DIR) && npm install

# Entry point: run the site locally
run: install
	cd $(SITE_DIR) && npm run dev

test: install
	cd $(SITE_DIR) && npm test

screenshots: install
	cd $(SITE_DIR) && npm run screenshots

build: install
	cd $(SITE_DIR) && npm run build

help:
	@echo "install     - npm install in site/"
	@echo "run         - run site dev server"
	@echo "test        - run site unit test suite (vitest)"
	@echo "screenshots - capture Playwright screenshots (needs browser deps)"
	@echo "build       - production build into site/dist"

.PHONY: install run test screenshots build help
