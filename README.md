# Local (macOS)

## Initial Setup

The "bootstrap" script installs pre-requisite tools and dependencies. It is idempontent, so you can run it again to update elements when needed.

```shell
bin/bootstrap
```

I use [ASDF](https://asdf-vm.com) so I can ensure required tools with specific versions are available and active when working with the project.

I use [yarn v2](https://yarnpkg.com) because npm leaves a lot to be desired.


If you get an error about keys or PGP when installing nodejs, reset the keyring by:

```shell
asdf plugin remove nodejs; asdf plugin add nodejs
```

Add the following to your shell profile:

```shell
export LOCALSTACK_ENDPOINT=http://localhost:4566

alias awslocal="aws --endpoint-url ${LOCALSTACK_ENDPOINT}"

localstack-restapi-url() {
  # e.g.: `curl $(localstack-api-url my-function) --data '{"foo":"bar"}'`
  local function=$1
  local stage=${2:-stage} # pulumi defaults to 'stage'
  local restapi_id=$(awslocal apigateway get-rest-apis | jq '.items' | grep -B1 "\"name\": \"${function}\"" | head -1 | grep -Eo '[a-z0-9]+' | tail -1)
  [ -z "${restapi_id}" ] && printf "No '${function}' Lambda found in '${stage}'" >&2 && return 1
  echo ${LOCALSTACK_ENDPOINT}/restapis/${restapi_id}/${stage}/_user_request_/${function}
}
```


## Stack templates

Because Pulumi doesn't (yet!) support project-wide configuration (they assume each "stack" may have its own configuration keys and values, but most often we have common keys with varying values), I have a project-wide template `stack.template.yaml` (for using against AWS) and a local stack template `local-stack.template.yaml` (for using against LocalStack).

These templates are merged and interpolated with shell environment variables in the `init-local-stack` script. Keys in the local template override keys in the non-local template.

You may wish to use a similar technique where each engineer has their own stack, but you have configuration keys that everyone should set, that either have common values or engineer-specific values. Those specific values can either be interpolated or overridden. 

## Test

```shell
yarn test
```

If test exit status is non-zero, or you set `KEEP_TEST_STACK` environment variable, the local test stack and LocalStack container are retained for diagnostic purposes.

```shell
KEEP_TEST_STACK=1 yarn test
```

Depending on the error, you may need to clear out the local test stack.

```shell
./init-local-stack --test --remove
docker compose down --volumes
```

### Unit tests

```shell
yarn test unit
```

## Run

```shell
docker compose up --detach
pulumi up  # -fy (skip preview, answer yes to change)

curl -i $(localstack-restapi-url contact) --data '{"email": "foo@bar.com"}'
```

And after LocalStack has fired up the Lambda (might take 10-20 seconds the first time), you'll get a response with a `Set-Cookie` header and the id of the record that's put into DynamoDB.



## Notes

If you get a conflict (someone has altered something manually):

```shell
pulumi refresh  # or, pulumi up -r
```

To reset the local stack:

```shell
./init-local-stack --reset
```

To remove the local stack:

```shell
./init-local-stack --remove
```

To stop the LocalStack container and remove its volume:

```shell
docker compose down --volumes
```
