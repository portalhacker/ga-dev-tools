"use client";

import { useEffect, useState } from "react";

import useGapiContext from "@/contexts/useGapiContext";
import {
  listGA4AccountSummaries,
  listGA4ProperyMetadata,
} from "@/utils/gapi-utils";

export default function RunReportForm() {
  const { isGapiReady, client, accessToken } = useGapiContext();

  const [formState, setFormState] = useState<{
    propertyId: number | null;
    dateRanges: gapi.client.analyticsdata.DateRange[] | null;
    dimensions: gapi.client.analyticsdata.Dimension[] | null;
    metrics: gapi.client.analyticsdata.Metric[] | null;
  }>({
    propertyId: null,
    dateRanges: null,
    dimensions: null,
    metrics: null,
  });
  const [options, setOptions] = useState<{
    accountSummaries:
      | gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaAccountSummary[]
      | null;
    properties:
      | (gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaPropertySummary & {
          accountDisplayName: string;
        })[]
      | null;
    metadata: gapi.client.analyticsdata.Metadata | null;
  }>({
    accountSummaries: null,
    properties: null,
    metadata: null,
  });
  const [isLoading, setIsLoading] = useState({
    accountSummaries: false,
    metadata: false,
    runReport: false,
  });

  useEffect(() => {
    async function fetchAccountSummaries() {
      if (!isGapiReady) {
        console.error("GAPI is not ready");
        return;
      }
      setIsLoading((prev) => ({ ...prev, accountSummaries: true }));
      const accountSummariesResponse = await listGA4AccountSummaries({
        accessToken: accessToken as gapi.client.TokenObject,
      });
      console.log("Account summaries response", accountSummariesResponse);
      const properties = accountSummariesResponse.accountSummaries
        ?.flatMap((accountSummary) =>
          accountSummary.propertySummaries?.map((propertySummary) => ({
            ...propertySummary,
            accountDisplayName: accountSummary.displayName,
          })),
        )
        ?.filter(
          (
            property,
          ): property is gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaPropertySummary & {
            accountDisplayName: string;
          } => property !== undefined,
        );
      console.log("Properties", properties);
      setOptions((prev) => ({
        ...prev,
        properties: properties ?? null,
      }));
      setIsLoading((prev) => ({ ...prev, accountSummaries: false }));
    }
    fetchAccountSummaries();
  }, [isGapiReady, accessToken]);

  useEffect(() => {
    async function fetchMetadata() {
      if (!isGapiReady) {
        console.error("GAPI is not ready");
        return;
      }
      if (!formState.propertyId) {
        console.error("Property ID is not set");
        return;
      }
      setIsLoading((prev) => ({ ...prev, metadata: true }));
      const metadataResponse = await listGA4ProperyMetadata({
        accessToken: accessToken as gapi.client.TokenObject,
        properyId: formState.propertyId,
      });
      console.log("Metadata response", metadataResponse);
      setOptions((prev) => ({
        ...prev,
        metadata: metadataResponse,
      }));
      setIsLoading((prev) => ({ ...prev, metadata: false }));
    }
    fetchMetadata();
  }, [formState.propertyId]);

  return (
    <div>
      <h2>Run Report Form</h2>
      <select
        value={formState.propertyId ?? ""}
        onChange={(e) => {
          const newPropertyId = parseInt(e.target.value);
          setFormState((prev) => ({ ...prev, propertyId: newPropertyId }));
        }}
      >
        {isLoading.accountSummaries ? (
          <option>Loading...</option>
        ) : (
          <>
            <option value="">Select Property</option>
            {options.properties?.map((property) => (
              <option
                key={property.property?.split("/")[1]}
                value={property.property?.split("/")[1]}
              >
                {property.accountDisplayName} - ({property.displayName})
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
}
