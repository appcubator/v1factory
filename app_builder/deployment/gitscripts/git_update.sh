#!/bin/bash

git add -A
git ls-files --deleted -z | xargs -0 git rm
git commit -a -m "changes"
git push -u -f origin master
