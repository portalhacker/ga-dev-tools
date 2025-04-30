export async function loadAnalyticsMetadata(
  accessToken: gapi.client.TokenObject,
): Promise<gapi.client.analyticsdata.Metadata> {
  window.gapi.client.setToken(accessToken);

  await window.gapi.client.load(
    "https://analyticsdata.googleapis.com/$discovery/rest?version=v1beta",
  );

  console.log("GAPI analyticsdata loaded for API");

  const response =
    await window.gapi.client.analyticsdata.properties.getMetadata({
      name: "properties/456086743/metadata",
    });

  console.log("Response", response);

  return response.result;
}
