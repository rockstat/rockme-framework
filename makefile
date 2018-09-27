PERCENT := %
DEL := /
BR != shell git branch | grep \* | cut -d ' ' -f2-

esc_repo := $(subst $(DEL),$(PERCENT)2F,$(repo))

br:
	@echo "$(BR)"

bump-patch:
	bumpversion patch

bump-minor:
	bumpversion minor

up_master: 
	@echo "on branch $(BR)"
	
	@[ "$(BR)" == "dev" ] && true || (echo "only dev can be used. you on $(BR)" && exit 1)
	@[ -z "$(git status --porcelain)" ] && true || (echo "directory not clean. commit changes first" && exit 1)
	@git checkout master && git rebase dev && git push origin master && git checkout dev \
		&& echo "master rebased and pushed"

to_master:
	@echo $(BR)
	git checkout master && git rebase $(BR) && git checkout $(BR)

push:
	git push origin master
	git push origin dev

travis-trigger:

	BODY='{"request": {"branch":"$(br)" }}'
	curl -s -X POST -v \
		-H "Content-Type: application/json" \
		-H "Accept: application/json" \
		-H "Travis-API-Version: 3" \
		-H "Authorization: token $$TRAVIS_TOKEN" \
		-d "$$BODY" \
		https://api.travis-ci.com/repo/$(esc_repo)/requests
