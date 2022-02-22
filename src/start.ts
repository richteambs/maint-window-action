import * as core from '@actions/core';
import { wait } from './wait';

async function run(): Promise<void> {
  try {
    const apiUrl: string = core.getInput('api-url');
    core.debug(`API URL: ${apiUrl}`); // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString());
    await wait(5);
    core.debug(new Date().toTimeString());

    core.setOutput('time', new Date().toTimeString());
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

void run();
