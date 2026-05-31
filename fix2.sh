#!/bin/bash
cd ~/domains/zaghroutaa.com/public_html || exit 1
cp .htaccess ".htaccess.bak2.$(date +%s)"
perl -i -pe 's{"https://zaghroutaa\.com"SetEnv UPLOAD_DIR /home/u405809647/domains/zaghroutaa\.com/persist-uploads}{"https://zaghroutaa.com"\nSetEnv UPLOAD_DIR "/home/u405809647/domains/zaghroutaa.com/persist-uploads"}g' .htaccess
mkdir -p ~/domains/zaghroutaa.com/persist-uploads
echo "=== SetEnv lines after fix ==="
grep -n SetEnv .htaccess
touch ~/domains/zaghroutaa.com/nodejs/tmp/restart.txt
echo DONE
