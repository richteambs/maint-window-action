import { expect, describe, it, afterEach } from '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { MaintainizrApi, isMaintenanceOccurrence } from '../maintainizr-api';

describe('Start maintenance', () => {
  let mock: MockAdapter;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it('calls the API endpoint correctly', async () => {
    // *** ARRANGE ***
    const api = new MaintainizrApi('ROOT_URL/', '12345');

    mock.onPost('ROOT_URL/api/maintenance/567/end').reply(200, null);

    // *** ACT ***
    await api.startMaintenance('567', 43);

    // *** ASSERT ***
    expect(mock.history.post[0].url).toEqual('ROOT_URL/api/monitors/567/start-maintenance');
    expect(mock.history.post[0].headers!['x-functions-key']).toEqual('12345');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const obj: any = JSON.parse(<string>mock.history.post[0].data);
    expect(obj).toHaveProperty('durationMinutes', 43);
  });

  it('returns the maintenance object when successful', async () => {
    // *** ARRANGE ***
    const api = new MaintainizrApi('ROOT_URL', 'appKey');
    const responseData = {
      maintenanceId: '90201',
      displayName: 'Ad hoc maintenance',
      status: 'scheduled',
      startDateTime: '2022-02-28T09:38:00+00:00',
      endDateTime: '2022-02-28T09:39:00+00:00',
      monitors: ['1234567890'],
    };

    mock.onPost('ROOT_URL/api/monitors/567/start-maintenance').reply(200, responseData);

    // *** ACT ***
    const response = await api.startMaintenance('567', 43);

    // *** ASSERT ***
    expect(mock.history.post[0].url).toEqual('ROOT_URL/api/monitors/567/start-maintenance');
    if (!isMaintenanceOccurrence(response.data)) {
      throw new Error("Shouldn't get here");
    }
    expect(response.data.maintenanceId).toBe('90201');
  });

  it('handles API error', async () => {
    // *** ARRANGE ***
    const api = new MaintainizrApi('ROOT_URL', 'appKey');
    const responseData = {
      status: 502,
      title: 'Error',
    };

    mock.onPost('ROOT_URL/api/monitors/500/start-maintenance').reply(502, responseData);

    // *** ACT ***
    const response = await api.startMaintenance('500', 1);

    // *** ASSERT ***
    expect(mock.history.post[0].url).toEqual('ROOT_URL/api/monitors/500/start-maintenance');
    expect(response.status).toBe(502);
  });
});

describe('End maintenance', () => {
  let mock: MockAdapter;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it('calls the API endpoint correctly', async () => {
    // *** ARRANGE ***
    const api = new MaintainizrApi('ROOT_URL/', '12345');

    mock.onPost('ROOT_URL/api/maintenance/567/end').reply(200, null);

    // *** ACT ***
    await api.endMaintenance('567');

    // *** ASSERT ***
    expect(mock.history.post[0].url).toEqual('ROOT_URL/api/maintenance/567/end');
    expect(mock.history.post[0].headers!['x-functions-key']).toEqual('12345');
  });

  it('handles API error', async () => {
    const api = new MaintainizrApi('ROOT_URL', 'appKey');

    const responseData = {
      status: 502,
      title: 'Error',
    };
    mock.onPost('ROOT_URL/api/maintenance/123/end').reply(502, responseData);

    // *** ACT ***
    const response = await api.endMaintenance('123');

    // *** ASSERT ***
    expect(mock.history.post[0].url).toEqual('ROOT_URL/api/maintenance/123/end');
    expect(response.status).toBe(502);
  });
});
