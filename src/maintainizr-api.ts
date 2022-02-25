import * as core from '@actions/core';
import axios, { AxiosError, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios';

interface StartMaintenanceParams {
  duration: number;
}

export interface MaintenanceOccurrence {
  maintenanceId: string;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  detail?: string;
  status: number;
  instance?: string;
}

type MaintenanceResponseContent = MaintenanceOccurrence | ProblemDetails;

export class MaintainizrApi {
  rootUrl: string;
  appKey: string;

  constructor(rootUrl: string, appKey: string) {
    // Strip any trailing slashes to normalize
    this.rootUrl = rootUrl.replace(/\/+$/g, '');
    this.appKey = appKey;
  }

  async startMaintenance(monitorID: string, duration: number): Promise<AxiosResponse<MaintenanceResponseContent>> {
    if (process.env['MAINTZ_USE_FAKE_API']?.toLowerCase() === 'true') {
      return this.callFakeStartMaintenanceApi(monitorID, duration);
    } else {
      return this.callRealStartMaintenanceApi(monitorID, duration);
    }
  }

  private async callRealStartMaintenanceApi(
    monitorID: string,
    duration: number
  ): Promise<AxiosResponse<MaintenanceResponseContent>> {
    try {
      const url = `${this.rootUrl}/api/monitors/${monitorID}/start-maintenance`;
      core.info(`Target URL: ${url}`);

      const body = {
        durationMinutes: duration,
      };
      const headers: AxiosRequestHeaders = { 'x-functions-key': this.appKey };
      const config: AxiosRequestConfig = {
        headers,
        // 👇 Don't throw an error for non-success HTTP status, we'll handle it ourselves
        validateStatus: () => true,
      };

      const response = await axios.post<StartMaintenanceParams, AxiosResponse<MaintenanceOccurrence | ProblemDetails>>(
        url,
        body,
        config
      );

      return response;
    } catch (err) {
      const error = err as Error | AxiosError;
      if (axios.isAxiosError(error)) {
        core.startGroup('Axios error details');
        core.info(JSON.stringify(error.toJSON()));
        core.endGroup();
      }

      throw err;
    }
  }

  private async callFakeStartMaintenanceApi(
    _monitorID: string,
    _duration: number
  ): Promise<AxiosResponse<MaintenanceResponseContent>> {
    const responseContent = process.env['MAINTZ_FAKE_RESPONSE_CONTENT'];
    if (!responseContent) {
      throw new Error('Environment variable MAINTZ_USE_FAKE_API is set, but MAINTZ_FAKE_RESPONSE_CONTENT is not set');
    }

    const response: AxiosResponse<MaintenanceResponseContent> = <AxiosResponse<MaintenanceResponseContent>>(
      JSON.parse(responseContent)
    );
    return Promise.resolve(response);
  }
}

export function isProblemDetails(data: unknown): data is ProblemDetails {
  return (data as ProblemDetails).status !== undefined;
}
