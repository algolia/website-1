.PHONY: start install serve build i18n-upload i18n-download

.DEFAULT_GOAL := start
start:
	@make install
	@make serve

install: test-bundler test-yarn
	@git submodule update --init --recursive
	@bundle install
	@yarn install

serve: test-bundler test-yarn
	@yarn start& bundle exec jekyll serve --incremental

build: test-bundler test-yarn
	@yarn build& bundle exec jekyll build

serve-production: test-bundler test-yarn
	@make crowdin-download
	@NODE_ENV=production yarn run build& JEKYLL_ENV=production bundle exec jekyll serve

build-production: test-bundler test-yarn
	@make crowdin-download
	@NODE_ENV=production yarn run build& JEKYLL_ENV=production bundle exec jekyll build
	@ruby ./scripts/validate-translations.rb

crowdin-upload: test-crowdin
	@crowdin-cli upload sources --auto-update -b master

crowdin-download: test-crowdin
	@crowdin-cli download -b master
	@ruby ./scripts/remove-unused-languages.rb
	@ruby ./scripts/normalize-translations.rb

###
# Misc stuff:
###

BUNDLE_EXISTS := $(shell command -v bundle 2> /dev/null)
CROWDIN_EXISTS := $(shell command -v crowdin-cli 2> /dev/null)
YARN_EXISTS := $(shell command -v yarn 2> /dev/null)

test-bundler:
ifndef BUNDLE_EXISTS
	$(error bundler is not installed. Run `gem install bundler`)
endif

test-crowdin:
ifndef CROWDIN_EXISTS
	$(error Crowdin is not installed. Run `make install`)
endif
ifndef CROWDIN_API_KEY
	$(error CROWDIN_API_KEY is undefined)
endif

test-yarn:
ifndef YARN_EXISTS
	$(error yarn is not installed. Follow the instructions on https://yarnpkg.com/docs/install)
endif
