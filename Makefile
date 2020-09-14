release-android:
	export ENV_PATH=.env.production
	expo build:android -t apk --release-channel production-v1
release-ios:
	export ENV_PATH=.env.production
	export FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD=pziv-etfq-fohj-guov
	git add --all
	npx standard-version -a -t v --release-as patch && git push --follow-tags origin master
	expo build:ios -t archive --release-channel production-v1
	expo upload:ios --latest --app-name 'Shop Shop' --sku 79ee0a7d-5bf2-40cc-ba1e-8e1293c08b5f --language Spanish_MX
	unset ENV_PATH
	unset FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD