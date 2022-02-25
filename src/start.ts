import * as core from '@actions/core';
import axios, { AxiosError } from 'axios';

import { MaintainizrApi, isProblemDetails } from './maintainizr-api';

async function run(): Promise<void> {
  try {
    const apiUrl: string = core.getInput('api-url', { required: true });
    const appKey: string = core.getInput('app-key', { required: true });
    const monitorID: string = core.getInput('monitor-id', { required: true });
    const duration: number = parseInt(core.getInput('duration', { required: true }));

    if (duration < 1 || duration > 1440) {
      core.setFailed("Input 'duration' must be between 1 and 1440 minutes");
      return;
    }

    const api = new MaintainizrApi(apiUrl, appKey);
    const response = await api.startMaintenance(monitorID, duration);

    core.startGroup('Maintainizr API response');
    core.info(`status: ${response.status} ${response.statusText}`);
    if (response.data) {
      core.info(JSON.stringify(response.data));
    } else {
      core.info('No response content');
    }
    core.endGroup();

    if (response.status < 200 || response.status > 299 || isProblemDetails(response.data)) {
      core.setFailed(`Call failed to Maintainizr API: ${response.status} ${response.statusText}`);
    } else {
      core.setOutput('maintenance-id', response.data.maintenanceId);
    }
  } catch (err) {
    const error = err as Error | AxiosError;
    if (axios.isAxiosError(error)) {
      core.startGroup('Error details');
      core.info(JSON.stringify(error.toJSON()));
      core.endGroup();
    }

    core.setFailed(error.message);
  }
}

void run();
