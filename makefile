PERCENT := %
DEL := /
BR != shell git branch | grep \* | cut -d ' ' -f2-


# versions

bump-patch:
	bumpversion patch

bump-minor:
	bumpversion minor

bump-major:
	bumpversion major

# git

up_master: 
	@echo "on branch $(BR)"
	
	@[ "$(BR)" == "dev" ] && true || (echo "only dev can be used. you on $(BR)" && exit 1)
	@[ -z "$(git status --porcelain)" ] && true || (echo "directory not clean. commit changes first" && exit 1)
	@git checkout master && git rebase dev && git push origin master && git checkout dev \
		&& echo "master rebased and pushed"

push:
	git push origin master
	git push origin dev

to_master:
	@echo $(BR)
	git checkout master && git rebase $(BR) && git checkout $(BR)

# common

build_macos_arm64:
	docker build --build-arg NPM_CONFIG_REGISTRY_ARG=http://host.docker.internal:4873/ --platform linux/amd64 -t band-base-ts .

build:
	docker build -t band-base-ts .

# ng

tag-ng:
	docker tag band-base-ts rockstat/band-base-ts:ng


push-ng:
	docker push rockstat/band-base-ts:ng

all-ng: build_macos_arm64 tag-ng push-ng

# latest

tag-latest:
	docker tag band-base-ts rockstat/band-base-ts:latest

push-latest:
	docker push rockstat/band-base-ts:latest

# dev

push-dev:
	docker tag band-base-ts rockstat/band-base-ts:dev
	docker push rockstat/band-base-ts:dev

travis-trigger:
	curl -vv -s -X POST \
		-H "Content-Type: application/json" \
		-H "Accept: application/json" \
		-H "Travis-API-Version: 3" \
		-H "Authorization: token $$TRAVIS_TOKEN" \
		-d '{ "request": { "branch":"$(br)" }}' \
		https://api.travis-ci.com/repo/$(subst $(DEL),$(PERCENT)2F,$(repo))/requests
