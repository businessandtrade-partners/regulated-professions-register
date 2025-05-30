# Accessing a live console

We need console access to bootstrap the service and occasionally running data migrations. We may
need a way to access live environments for debugging or incident management purposes.

## Prerequisites

You must have an account with the DBT Platform AWS account, and be connected to the DBT VPN in order to connect to the live console. The project members at DBT handle invitations.

You must have the following utilies installed:

- AWS CLI
- copilot

```bash
$ brew install awscli
$ brew install copilot
```

## Access

1. From a local terminal ensure that `~/.aws/config` exists and is populated (example file can be found in KeePass)

   ```properties
   [sso-session uktrade]
   sso_start_url = [URL]
   sso_region = eu-west-2
   sso_registration_scopes = sso:account:access

   [profile rpr]
   sso_session = uktrade
   sso_account_id = [ACCOUNT_ID]
   sso_role_name = [ROLE_NAME]
   region = eu-west-2
   output = json

   [profile rpr-prod]
   sso_session = uktrade
   sso_account_id = [ACCOUNT_ID]
   sso_role_name = [ROLE_NAME]
   region = eu-west-2
   output = json
   ```

2. Set the AWS profile you wish to you (rpr or rpr-prod)

   ```bash
   $ export AWS_PROFILE=rpr
   ```

3. Login to AWS using SSO; This will prompt a browser window to open to continue authentication.

   ```bash
   $ aws sso login
   ```

4. Connect to desired container; `--env` can be `prod`, `staging`, or `dev`

   ```bash
   copilot svc exec --app rpr --env dev --name web --command "launcher bash"
   ```
