import * as path from 'path';
import { expect, describe, it } from '@jest/globals';
import { AxiosResponse } from 'axios';
import { ProblemDetails } from '../maintainizr-api';
import { invokeActionScript, getAllErrors, ActionResult } from './test-utils';

interface EndActionParams {
  appUrl: string | null;
  appKey: string | null;
  maintenanceId: string | null;
  apiResponse: AxiosResponse<never | ProblemDetails> | null;
}

const DefaultParams: EndActionParams = {
  appUrl: 'http://dummy.example.com/',
  appKey: '12345',
  maintenanceId: '987654321',
  apiResponse: null,
};

describe('gh end action', () => {
  it('succeeds when the API returns a good response', () => {
    const fakeApiResponse: AxiosResponse = {
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

  it('errors when maintenance-id is not set', () => {
    const params = { ...DefaultParams };
    params.maintenanceId = null;
    const result = runAction(params);

    expect(result.isError).toBeTruthy();
    expect(getAllErrors(result)).toContain('Input required and not supplied: maintenance-id');
  });

  it('errors when maintenance-id is empty', () => {
    const params = { ...DefaultParams };
    params.maintenanceId = '';
    const result = runAction(params);

    expect(result.isError).toBeTruthy();
    expect(getAllErrors(result)).toContain('Input required and not supplied: maintenance-id');
  });
});

function runAction(params: EndActionParams): ActionResult {
  const env: NodeJS.ProcessEnv = {
    MAINTZ_USE_FAKE_API: 'true',
  };

  if (params.appUrl !== null) {
    env['INPUT_APP-URL'] = params.appUrl;
  }

  if (params.appKey !== null) {
    env['INPUT_APP-KEY'] = params.appKey;
  }

  if (params.maintenanceId !== null) {
    env['INPUT_MAINTENANCE-ID'] = params.maintenanceId;
  }

  if (params.apiResponse !== null) {
    env['MAINTZ_FAKE_RESPONSE_CONTENT'] = JSON.stringify(params.apiResponse);
  }

  return invokeActionScript(path.join(__dirname, '../../lib/end.js'), env);
}
