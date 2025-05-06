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
}: tokenProps): Promise<gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaListAccountSummariesResponse> {
  const discoveryDocument =
    "https://analyticsadmin.googleapis.com/$discovery/rest?version=v1beta";
  await initAPI({ accessToken, discoveryDocument });
  const response =
    await window.gapi.client.analyticsadmin.accountSummaries.list();
  console.log("Response", response);
  return response.result;
}

export async function listGA4Accounts({
  accessToken,
}: tokenProps): Promise<gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaListAccountsResponse> {
  const discoveryDocument =
    "https://analyticsadmin.googleapis.com/$discovery/rest?version=v1beta";
  await initAPI({ accessToken, discoveryDocument });
  const response = await window.gapi.client.analyticsadmin.accounts.list();
  console.log("Response", response);
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
  console.log("Response", response);
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
  const response = await window.gapi.client.analyticsdata.properties.runReport({
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
    },
  });
  console.log("Response", response);
  return response.result;
}
