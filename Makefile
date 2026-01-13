SITE_DIR = site
TERRAFORM_DIR = terraform

all: deploy

run:
	cd $(SITE_DIR) && npm run dev

test:
	cd $(SITE_DIR) && npm test
	cd $(SITE_DIR) && npm run screenshots

deploy:
	cd $(SITE_DIR) && npm run build
	cd $(TERRAFORM_DIR) && terraform apply -auto-approve
