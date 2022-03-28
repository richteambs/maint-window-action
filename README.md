# GitHub Actions for Maintenance Windows

This repo contains custom [GitHub Actions](https://docs.github.com/en/actions) that enable support
for starting and stopping maintenance windows within our [Site24x7](https://www.site24x7.com/)
uptime monitoring, so that any downtime during a deployment is marked as having occurred during
maintenance.

## Start maintenance

Use this action to start a maintenance window.

### Parameters

| Parameter | Description  |
| --------- | ------------ |
| `app-url` | See [below](#common-connection-parameters). |
| `app-key` | See [below](#common-connection-parameters). |
| `monitor-id` | The ID of the monitor that should be suspended during the maintenance window. This will be a long numeric string such as `633320000127123456` |
| `duration` | The planned duration of the maintenance window, in minutes. The window will automatically end after this period. |

### Outputs

| Output           | Description  |
| ---------------- | ------------ |
| `maintenance-id` | The ID of the maintenance window instance that was created. This can be used to cancel the maintenance window if required. |

### Example

```yaml
uses: richteambs/maintainizr-action/start@v1
with:
    app-url: ${{ secrets.MAINTZ_FUNC_URL }}
    app-key: ${{ secrets.MAINTZ_FUNC_APP_KEY }}
    monitor-id: '12345'
    duration: 1 # 1 minute
```

## End maintenance

Use this action to end a maintenance window.

If you don't call this action, the window will automatically end after the `duration` specified when
the window was started.

If you call this action when the window is already ended, it will _not_ report an error. This means
you can safely call it even if you have overrun the maintenance window, or if you have called it
multiple times.

If you pass an invalid maintenance id, the action will report an error.

### Parameters

| Parameter | Description  |
| --------- | ------------ |
| `app-url` | See [below](#common-connection-parameters). |
| `app-key` | See [below](#common-connection-parameters). |
| `maintenance-id` | The ID of the maintenance window to terminate. This should be the value output by the `start` action. |

### Example

```yaml
uses: richteambs/maintainizr-action/end@v1
with:
    app-url: '${{ secrets.MAINTZ_FUNC_URL }}'
    app-key: ${{ secrets.MAINTZ_FUNC_APP_KEY }}
    maintenance-id: ${{ needs.start_maintenance.outputs.maintenance-id }}
```

## Common connection parameters

The actions in this repo work by contacting the Maintainizr API, which in turn contacts the Site24x7
API (the Maintainizr API provides a simplified facade). You therefore need to provide some
parameters that specify the connection details for the Maintainizr API. These parameters are common
to all the actions in this repository.

| Parameter | Description  |
| --------- | ------------ |
| `app-url` | The root URL of the Maintainizr API. |
| `app-key` | A secret key that is required for security purposes. <br/>:warning: This value should not be stored in plaintext in your repo or anywhere else in GitHub, except as an [encrypted secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets). |

[This
article](https://mbs.atlassian.net/wiki/spaces/DO/pages/2419523603/Creating+an+Azure+Function+App+Service+Connection/)
(MBS Confluence) documents how to find out the values to use for these parameters.

### Credits

[Rocket Icon Vectors by Vecteezy](https://www.vecteezy.com/free-vector/rocket-icon)
