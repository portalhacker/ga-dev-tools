type initAPIProps = {
  accessToken: gapi.client.TokenObject;
  discoveryDocument: string;
};

type tokenProps = {
  accessToken: gapi.client.TokenObject;
};

type GA4ProperyProps = tokenProps & {
  propertyId: number;
};

type GA4ReportProps = GA4ProperyProps & {
  dateRanges: gapi.client.analyticsdata.DateRange[];
  dimensions: gapi.client.analyticsdata.Dimension[];
  metrics: gapi.client.analyticsdata.Metric[];
};

async function initAPI({ accessToken, discoveryDocument }: initAPIProps) {
  if (!accessToken) {
    throw new Error("Access token is not set");
  }
  window.gapi.client.setToken(accessToken);
  await window.gapi.client.load(discoveryDocument);
  const apiName = discoveryDocument.split("/")[2];
  console.log(`GAPI ${apiName} loaded for API`);
}

export async function listGA4AccountSummaries({
  accessToken,
}: tokenProps): Promise<
  gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaAccountSummary[]
> {
  const discoveryDocument =
    "https://analyticsadmin.googleapis.com/$discovery/rest?version=v1beta";
  await initAPI({ accessToken, discoveryDocument });
  let nextPageToken: string | undefined;
  let accountSummaries: gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaAccountSummary[] =
    [];
  do {
    const response =
      await window.gapi.client.analyticsadmin.accountSummaries.list({
        pageSize: 200,
        pageToken: nextPageToken,
      });
    if (response.status !== 200) {
      throw new Error(
        `Error fetching account summaries: ${response.statusText}`,
      );
    }
    const data = response.result;
    if (data.accountSummaries) {
      accountSummaries = accountSummaries.concat(data.accountSummaries);
    }
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);
  return accountSummaries;
}

export async function listGA4Accounts({
  accessToken,
}: tokenProps): Promise<gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaListAccountsResponse> {
  const discoveryDocument =
    "https://analyticsadmin.googleapis.com/$discovery/rest?version=v1beta";
  await initAPI({ accessToken, discoveryDocument });
  const response = await window.gapi.client.analyticsadmin.accounts.list();
  return response.result;
}

export async function listGA4ProperyMetadata({
  accessToken,
  propertyId,
}: GA4ProperyProps): Promise<gapi.client.analyticsdata.Metadata> {
  const discoveryDocument =
    "https://analyticsdata.googleapis.com/$discovery/rest?version=v1beta";
  await initAPI({ accessToken, discoveryDocument });
  const response =
    await window.gapi.client.analyticsdata.properties.getMetadata({
      name: `properties/${propertyId}/metadata`,
    });
  return response.result;
}

export async function runGA4Report({
  accessToken,
  propertyId,
  dateRanges,
  dimensions,
  metrics,
}: GA4ReportProps): Promise<gapi.client.analyticsdata.RunReportResponse> {
  const discoveryDocument =
    "https://analyticsdata.googleapis.com/$discovery/rest?version=v1beta";
  await initAPI({ accessToken, discoveryDocument });
  let datas: gapi.client.analyticsdata.RunReportResponse = {
    dimensionHeaders: [],
    metricHeaders: [],
    rows: [],
    rowCount: 0,
    metadata: undefined,
    propertyQuota: undefined,
    kind: undefined,
  };
  let maxLimit = 250000;
  let limit = maxLimit;
  let offset = 0;

  do {
    const response =
      await window.gapi.client.analyticsdata.properties.runReport({
        property: `properties/${propertyId}`,
        resource: {
          dateRanges: dateRanges.map((dateRange) => ({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          })),
          dimensions: dimensions.map((dimension) => ({
            name: dimension.name,
          })),
          metrics: metrics.map((metric) => ({
            name: metric.name,
          })),
          returnPropertyQuota: true,
          limit: String(limit),
          offset: String(offset),
        },
      });
    if (response.status !== 200) {
      throw new Error(`Error fetching report data: ${response.statusText}`);
    }
    const data = response.result;
    if (data.rows) {
      datas = {
        ...data,
        rows: data.rows.map((row) => ({
          dimensionValues: row.dimensionValues,
          metricValues: row.metricValues,
        })),
      };
    }
    if (data.rowCount && data.rowCount > limit + offset) {
      offset += limit;
      limit = Math.min(data.rowCount - offset, maxLimit);
    } else {
      offset = data.rowCount || 0;
    }
  } while (offset < (datas?.rowCount || 0));
  return datas;
}
