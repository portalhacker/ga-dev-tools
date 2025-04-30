type initAPIProps = {
  accessToken: gapi.client.TokenObject;
  discoveryDocument: string;
};

type tokenProps = {
  accessToken: gapi.client.TokenObject;
};

type GA4ProperyProps = tokenProps & {
  properyId: number;
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
  properyId,
}: GA4ProperyProps): Promise<gapi.client.analyticsdata.Metadata> {
  const discoveryDocument =
    "https://analyticsdata.googleapis.com/$discovery/rest?version=v1beta";
  await initAPI({ accessToken, discoveryDocument });

  const response =
    await window.gapi.client.analyticsdata.properties.getMetadata({
      name: `properties/${properyId}/metadata`,
    });
  console.log("Response", response);
  return response.result;
}
