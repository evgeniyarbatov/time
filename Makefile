SITE_DIR = site
TERRAFORM_DIR = terraform

all: deploy

deploy:
	cd $(SITE_DIR) && npm run build
	cd $(TERRAFORM_DIR) && terraform apply -auto-approve

.PHONY: deploy
