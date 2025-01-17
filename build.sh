npm i
pkg -C GZip ./index.js
mkdir ./lin
mkdir ./mac
mkdir ./win
mv index-linux ./lin/simga
mv index-macos ./mac/simga
mv index-win.exe ./win/simga.exe
cp ./assets ./lin/assets -r
cp ./assets ./mac/assets -r
cp ./assets ./win/assets -r
zip -r ./simga-lin.zip ./lin
zip -r ./simga-mac.zip ./mac
zip -r ./simga-win.zip ./win
rm -rf ./win
rm -rf ./mac
rm -rf ./lin