release-android:
	export ENV_PATH=.env.production
	expo build:android -t apk --release-channel production-v1
release-ios:
	export ENV_PATH=.env.production
	git add --all
	npx standard-version -a -t v --release-as patch && git push --follow-tags origin master
	expo build:ios -t archive --release-channel production-v1
	expo upload:ios
	unset ENV_PATH