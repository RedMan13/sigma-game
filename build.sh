npm i
pkg -C GZip ./index.js --out-path ./dist
cp ./assets ./dist/assets -r
cd ./dist
mv index-linux lin-simga
mv index-macos mac-simga
mv index-win.exe win-simga.exe
cd ..
zip -r ./prod.zip ./dist
rm -rf ./dist