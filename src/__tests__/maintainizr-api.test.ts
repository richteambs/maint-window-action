import { jest, expect, describe, it, afterEach } from '@jest/globals';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { MaintainizrApi, isProblemDetails, ProblemDetails, MaintenanceOccurrence } from '../maintainizr-api';

jest.mock('axios');
const mockAxios = jest.mocked(axios, true);

describe('MaintainizrApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls the API endpoint correctly', async () => {
    // *** ARRANGE ***
    mockAxios.post.mockImplementation(() => {
      const response: AxiosResponse<ProblemDetails> = {
        status: 502,
        statusText: 'Bad gateway',
        headers: {},
        config: {},
        data: {
          status: 502,
          title: 'Error',
        },
      };
      return Promise.resolve(response);
    });

    const api = new MaintainizrApi('http://localhost:7071/', '12345');

    // *** ACT ***
    await api.startMaintenance('567', 43);

    // *** ASSERT ***
    expect(mockAxios.post).toHaveBeenCalledTimes(1);

    const call = mockAxios.post.mock.calls[0];
    expect(call[0]).toBe('http://localhost:7071/api/monitors/567/start-maintenance');
    expect((call[1] as { durationMinutes: number }).durationMinutes).toBe(43);
    expect((call[2] as AxiosRequestConfig).headers).toHaveProperty('x-functions-key', '12345');
  });

  it('returns the maintenance object when successful', async () => {
    // *** ARRANGE ***
    mockAxios.post.mockImplementation(() => {
      const response: AxiosResponse<MaintenanceOccurrence> = {
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        data: {
          maintenanceId: '90201',
        },
      };
      return Promise.resolve(response);
    });

    const api = new MaintainizrApi('', '');

    // *** ACT ***
    const response = await api.startMaintenance('567', 43);

    // *** ASSERT ***
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    if (isProblemDetails(response.data)) {
      throw "Shouldn't happen";
    }
    expect(response.data.maintenanceId).toBe('90201');
  });

  it('handles API error', async () => {
    // *** ARRANGE ***
    mockAxios.post.mockImplementation(() => {
      const response: AxiosResponse<ProblemDetails> = {
        status: 502,
        statusText: 'Bad gateway',
        headers: {},
        config: {},
        data: {
          status: 502,
          title: 'Error',
        },
      };
      return Promise.resolve(response);
    });

    const api = new MaintainizrApi('rootUrl', 'appKey');

    // *** ACT ***
    const response = await api.startMaintenance('500', 1);

    // *** ASSERT ***
    const isProblem = isProblemDetails(response.data);
    expect(isProblem).toBe(true);
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });
});
