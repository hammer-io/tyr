# SECURITY INFORMATION MANAGEMENT POLICY

## Why do we need your username and password for different accounts?
We need your username and password to access third party applications. Since we are not in a web browser, we do not have the capability of accessing your information through redirect pages. 
In order to complete the items below, we need to authenticate into your account, which requires us to use Basic Authentication which needs a username and password. 
If you feel uncomfortable sharing your login credentials, you can simply skip using any third party tools. If you'd like to use third party tools, but don't want to share your credentials, 
check out our Web Application, [Yggdrasil](https://github.com/hammer-io/yggdrasil), which is coming soon. 

In the mean time, we urge you to check out the source code and see exactly how we are using your username and password. 

## What do we do with your username and password?
* Read your GitHub account details, create a GitHub token, delete a GitHub token, create a GitHub repository, push to your GitHub repository through the official (GitHub API)[https://developer.github.com/v3/].
* Read your Heroku account details, create a Heroku Application through the official (Heroku API)[https://devcenter.heroku.com/articles/platform-api-reference].

## What do we not do with your username and password?
* Share your username and password with anyone
* Store your username or password in any database or any temporary/permanent files
* Access information which is not listed above
