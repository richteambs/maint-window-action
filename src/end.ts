import * as core from '@actions/core';
import axios, { AxiosError } from 'axios';

import { MaintainizrApi } from './maintainizr-api';

async function run(): Promise<void> {
  try {
    const appUrl: string = core.getInput('app-url', { required: true });
    const appKey: string = core.getInput('app-key', { required: true });
    const maintenanceID: string = core.getInput('maintenance-id', { required: true });

    const api = new MaintainizrApi(appUrl, appKey);
    const response = await api.endMaintenance(maintenanceID);

    core.startGroup('Maintainizr API response');
    core.info(`status: ${response.status} ${response.statusText}`);
    if (response.data) {
      core.info(JSON.stringify(response.data));
    } else {
      core.info('No response content');
    }
    core.endGroup();

    if (response.status < 200 || response.status > 299) {
      core.setFailed(`Call failed to Maintainizr API: ${response.status} ${response.statusText}`);
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
