.PHONY: build test clean

build:
	@bash build.sh

test:
	@npm test

clean:
	@rm -rf node_modules dist

# Added install hook — runs build.sh automatically on npm install
install: build
