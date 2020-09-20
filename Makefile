all: extract

install: extract copy


extract:
	node_modules/.bin/rollup extract.js --file ./plugins/extract.js --format cjs

extract_watch:
	node_modules/.bin/rollup extract.js --file ~/volcano/plugins/extract.js --format cjs --watch

copy:
	cp ./plugins/*.js ~/volcano/plugins/