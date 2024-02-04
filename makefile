PERCENT := %
DEL := /
BR != shell git branch | grep \* | cut -d ' ' -f2-


bump-patch:
	bumpversion patch

bump-minor:
	bumpversion minor

bump-major:
	bumpversion major

up_master: 
	@echo "on branch $(BR)"
	
	@[ "$(BR)" == "dev" ] && true || (echo "only dev can be used. you on $(BR)" && exit 1)
	@[ -z "$(git status --porcelain)" ] && true || (echo "directory not clean. commit changes first" && exit 1)
	@git checkout master && git rebase dev && git push origin master && git checkout dev \
		&& echo "master rebased and pushed"

to_master:
	@echo $(BR)
	git checkout master && git rebase $(BR) && git checkout $(BR)

build_amd64:
	docker buildx build --platform linux/amd64 -t band-base-ts .

build:
	docker build -t band-base-ts .

tag-ng:
	docker tag band-base-ts rockstat/band-base-ts:ng

tag-latest:
	docker tag band-base-ts rockstat/band-base-ts:latest

push-ng:
	docker push rockstat/band-base-ts:ng

push-latest:
	docker push rockstat/band-base-ts:latest

push-dev:
	docker tag band-base-ts rockstat/band-base-ts:dev
	docker push rockstat/band-base-ts:dev

full-ng: build_amd64 tag-ng push-ng


push:
	git push origin master
	git push origin dev

travis-trigger:
	curl -vv -s -X POST \
		-H "Content-Type: application/json" \
		-H "Accept: application/json" \
		-H "Travis-API-Version: 3" \
		-H "Authorization: token $$TRAVIS_TOKEN" \
		-d '{ "request": { "branch":"$(br)" }}' \
		https://api.travis-ci.com/repo/$(subst $(DEL),$(PERCENT)2F,$(repo))/requests
