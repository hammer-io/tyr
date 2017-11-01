#!/bin/bash

# USAGE: delete_all_repos.sh <auth_token>

if [ -z $1 ]; then
    echo "USAGE: delete_all_repos.sh <auth_token>"
    exit 1
fi

USER_TO_OBLITERATE=Holmgang

read -p "Are you sure you want to obliterate all of ${USER_TO_OBLITERATE}'s public repositories? " -n 1 -r
if [[ $REPLY =~ ^[^Yy]$ ]]; then
    echo
    exit 0
fi
echo
sleep 1
printf ...
sleep 1
read -p "You're completely sure? " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    CURL_OUTPUT=`mktemp`
    REPOS_TO_DELETE=`mktemp`

    curl "https://api.github.com/users/${USER_TO_OBLITERATE}/repos" -o $CURL_OUTPUT
    echo "Repositories to delete:"
    cat $CURL_OUTPUT | grep full_name

    cat $CURL_OUTPUT \
	| grep full_name    \
	| sed s/.*:\ \"//   \
	| sed s/\".*// > $REPOS_TO_DELETE

    read -p "Continue? " -n 1 -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo
        while read r; do
    	curl -XDELETE -H \
    	     "Authorization: token $1" "https://api.github.com/repos/$r "
        done < $REPOS_TO_DELETE
    fi
fi
echo
