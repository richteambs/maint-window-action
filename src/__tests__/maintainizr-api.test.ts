import { jest, expect, describe, it, afterEach } from '@jest/globals';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { MaintainizrApi, ProblemDetails, MaintenanceOccurrence, isMaintenanceOccurrence } from '../maintainizr-api';

jest.mock('axios');
const mockAxios = jest.mocked(axios, true);

describe('Start maintenance', () => {
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
          displayName: 'Ad hoc maintenance',
          status: 'scheduled',
          startDateTime: '2022-02-28T09:38:00+00:00',
          endDateTime: '2022-02-28T09:39:00+00:00',
          monitors: ['1234567890'],
        },
      };
      return Promise.resolve(response);
    });

    const api = new MaintainizrApi('rootUrl', 'appKey');

    // *** ACT ***
    const response = await api.startMaintenance('567', 43);

    // *** ASSERT ***
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    if (!isMaintenanceOccurrence(response.data)) {
      throw new Error("Shouldn't get here");
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
    expect(response.status).toBe(502);
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });
});

describe('End maintenance', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls the API endpoint correctly', async () => {
    // *** ARRANGE ***
    mockAxios.post.mockImplementation(() => {
      const response: AxiosResponse = {
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        data: null,
      };
      return Promise.resolve(response);
    });

    const api = new MaintainizrApi('http://localhost:7071/', '12345');

    // *** ACT ***
    await api.endMaintenance('567');

    // *** ASSERT ***
    expect(mockAxios.post).toHaveBeenCalledTimes(1);

    const call = mockAxios.post.mock.calls[0];
    expect(call[0]).toBe('http://localhost:7071/api/maintenance/567/end');
    expect(call[1]).toBeNull();
    expect((call[2] as AxiosRequestConfig).headers).toHaveProperty('x-functions-key', '12345');
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
    const response = await api.endMaintenance('123');

    // *** ASSERT ***
    expect(response.status).toBe(502);
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });
});
