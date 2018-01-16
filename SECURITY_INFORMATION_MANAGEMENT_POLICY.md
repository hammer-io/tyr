# SECURITY INFORMATION MANAGEMENT POLICY

## Why do we need your username and password for different accounts?

The integration of third party applications allows us to automate
the setup of the DevOps pipeline for your project. Each component
in the pipeline requires authenticated access, so we need to prompt
for the various credentials to take the necessary steps to complete
the setup.

If you feel uncomfortable sharing your login credentials, you can
simply skip using any third party tools. If you'd like to use third
party tools, but don't want to share your credentials through the
command line, check out our Web Application,
[Yggdrasil](https://github.com/hammer-io/yggdrasil) (Coming Soon!).

In the mean time, we urge you to check out the source code and see
exactly how we are using your username and password.

## How we use your credentials

* If you opt to use GitHub for source control, your credentials
  are used to create the new project repository, push the generated
  source code to the new repository, and facilitate other actions
  relevant to the Tyr project.
* If you opt to use TravisCI for continuous integration, your GitHub
  credentials are used to activate and configure the Tyr project in
  the TravisCI environment.
* If you opt to deploy your project on Heroku, your credentials are
  used to create and configure the Heroku Application for the Tyr
  project.
* In general, as more third party applications are integrated into
  Tyr, the credentials we request are simply used to facilitate DevOps
  activities for your project.

## What we do NOT do with your credentials

* Share your username and password with anyone
* Store your username or password in any database or any
  temporary/permanent files
* Access information which is not listed above
* Access any projects (on GitHub, Heroku, or elsewhere) other than the
  one being generated/managed by Tyr.
