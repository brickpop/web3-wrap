.DEFAULT_GOAL := info
.PHONY: info

PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

###############################################################################
## INFO
###############################################################################

info:
	@echo "Available actions:"
	@echo
	@echo "  $$ run         Runs 'run info' by default"
	@echo "  $$ run info    Shows this text"
	@echo
	@echo "  $$ run dev     Start the bundler"
	@echo

###############################################################################
## RECIPES
###############################################################################

dev:
	@./node_modules/.bin/webpack-cli --config webpack.config.js
	@./node_modules/.bin/serve
