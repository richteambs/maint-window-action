import * as path from 'path';
import { expect, describe, it } from '@jest/globals';
import { AxiosResponse } from 'axios';
import { ProblemDetails, MaintenanceOccurrence } from '../maintainizr-api';
import { invokeActionScript, getAllErrors, getOutputVariables, ActionResult } from './test-utils';

interface StartActionParams {
  appUrl: string | null;
  appKey: string | null;
  monitorId: string | null;
  duration: number | null;
  apiResponse: AxiosResponse<MaintenanceOccurrence | ProblemDetails> | null;
}

const DefaultParams: StartActionParams = {
  appUrl: 'http://dummy.example.com/',
  appKey: '12345',
  monitorId: '987654321',
  duration: 10,
  apiResponse: null,
};

describe('gh start action', () => {
  it('succeeds and sets the output when the API returns a good response', () => {
    const fakeApiResponse: AxiosResponse<MaintenanceOccurrence> = {
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
      data: {
        maintenanceId: '902010',
      },
    };

    const params = { ...DefaultParams };
    params.apiResponse = fakeApiResponse;
    const result = runAction(params);

    expect(result.isError).toBeFalsy();
    expect(getAllErrors(result).length).toBe(0);
    const o = getOutputVariables(result);
    expect(o).toHaveProperty('maintenance-id', '902010');
  });

  it('fails when the API returns a bad response', () => {
    const fakeApiResponse: AxiosResponse<ProblemDetails> = {
      status: 502,
      statusText: 'Bad gateway',
      headers: {},
      config: {},
      data: {
        status: 502,
        type: 'https://tools.ietf.org/html/rfc7231#section-6.6.3',
      },
    };

    const params = { ...DefaultParams };
    params.apiResponse = fakeApiResponse;
    const result = runAction(params);

    expect(result.isError).toBeTruthy();
    expect(getAllErrors(result)).toContain('Call failed to Maintainizr API: 502 Bad gateway');
  });

  it('errors when monitor-id is not set', () => {
    const params = { ...DefaultParams };
    params.monitorId = null;
    const result = runAction(params);

    expect(result.isError).toBeTruthy();
    expect(getAllErrors(result)).toContain('Input required and not supplied: monitor-id');
  });

  it('errors when monitor-id is empty', () => {
    const params = { ...DefaultParams };
    params.monitorId = '';
    const result = runAction(params);

    expect(result.isError).toBeTruthy();
    expect(getAllErrors(result)).toContain('Input required and not supplied: monitor-id');
  });

  it('errors when duration is not set', () => {
    const params = { ...DefaultParams };
    params.duration = null;
    const result = runAction(params);

    expect(result.isError).toBeTruthy();
    expect(getAllErrors(result)).toContain('Input required and not supplied: duration');
  });

  it('errors when duration is zero', () => {
    const params = { ...DefaultParams };
    params.duration = 0;
    const result = runAction(params);

    expect(result.isError).toBeTruthy();
    expect(getAllErrors(result)).toContain("Input 'duration' must be between 1 and 1440 minutes");
  });
});

function runAction(params: StartActionParams): ActionResult {
  const env: NodeJS.ProcessEnv = {
    MAINTZ_USE_FAKE_API: 'true',
  };

  if (params.appUrl !== null) {
    env['INPUT_APP-URL'] = params.appUrl;
  }

  if (params.appKey !== null) {
    env['INPUT_APP-KEY'] = params.appKey;
  }

  if (params.monitorId !== null) {
    env['INPUT_MONITOR-ID'] = params.monitorId;
  }

  if (params.duration !== null) {
    env['INPUT_DURATION'] = `${params.duration}`;
  }

  if (params.apiResponse !== null) {
    env['MAINTZ_FAKE_RESPONSE_CONTENT'] = JSON.stringify(params.apiResponse);
  }

  return invokeActionScript(path.join(__dirname, '../../lib/start.js'), env);
}
