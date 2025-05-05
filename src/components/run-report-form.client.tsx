"use client";

import { useEffect, useState } from "react";

import useGapiContext from "@/contexts/useGapiContext";
import {
  listGA4AccountSummaries,
  listGA4ProperyMetadata,
  runGA4Report,
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
  const [reportData, setReportData] =
    useState<gapi.client.analyticsdata.RunReportResponse | null>(null);
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
      <h2 className="text-xl font-medium">Run Report Form</h2>
      <form className="flex flex-col gap-4">
        <select
          value={formState.propertyId ?? ""}
          className="border-2"
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
        <input
          type="date"
          className="border-2"
          value={
            formState.dateRanges?.[0]?.startDate ??
            new Date().toISOString().split("T")[0]
          }
          onChange={(e) => {
            const newDateRanges = [
              {
                startDate: e.target.value,
                endDate: new Date(
                  new Date(e.target.value).getTime() + 24 * 90 * 60 * 60 * 1000,
                )
                  .toISOString()
                  .split("T")[0],
              },
            ];
            setFormState((prev) => ({ ...prev, dateRanges: newDateRanges }));
          }}
          // disabled={!formState.propertyId}
        />
        <select
          multiple
          className="h-40 border-2"
          onChange={(e) => {
            const selectedDimensions = Array.from(e.target.selectedOptions).map(
              (option) => ({
                name: option.value,
              }),
            );
            setFormState((prev) => ({
              ...prev,
              dimensions: selectedDimensions,
            }));
          }}
        >
          {isLoading.metadata ? (
            <option>Loading...</option>
          ) : (
            <>
              {options.metadata?.dimensions?.map((dimension) => (
                <option key={dimension.apiName} value={dimension.apiName}>
                  {dimension.apiName}
                  {" - "}
                  {dimension.uiName}
                </option>
              ))}
            </>
          )}
        </select>
        <select
          multiple
          className="h-40 border-2"
          onChange={(e) => {
            const selectedMetrics = Array.from(e.target.selectedOptions).map(
              (option) => ({
                name: option.value,
              }),
            );
            setFormState((prev) => ({
              ...prev,
              metrics: selectedMetrics,
            }));
          }}
        >
          {isLoading.metadata ? (
            <option>Loading...</option>
          ) : (
            <>
              {options.metadata?.metrics?.map((metric) => (
                <option key={metric.apiName} value={metric.apiName}>
                  {metric.apiName}
                  {" - "}
                  {metric.uiName}
                </option>
              ))}
            </>
          )}
        </select>
        <button
          type="button"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:cursor-pointer hover:bg-blue-600"
          onClick={async () => {
            if (!isGapiReady) {
              console.error("GAPI is not ready");
              return;
            }
            if (!formState.propertyId) {
              console.error("Property ID is not set");
              return;
            }
            if (!formState.dateRanges) {
              console.error("Date ranges are not set");
              return;
            }
            if (!formState.metrics) {
              console.error("Metrics are not set");
              return;
            }
            setIsLoading((prev) => ({ ...prev, runReport: true }));
            const runReportResponse = await runGA4Report({
              accessToken: accessToken as gapi.client.TokenObject,
              properyId: formState.propertyId,
              dateRanges: formState.dateRanges,
              dimensions: formState.dimensions ?? [],
              metrics: formState.metrics,
            });
            console.log("Run report response", runReportResponse);
            setReportData(runReportResponse);
            setIsLoading((prev) => ({ ...prev, runReport: false }));
          }}
        >
          {isLoading.runReport ? "Loading..." : "Run Report"}
        </button>
      </form>
      <div>
        {isLoading.runReport && <p>Loading...</p>}
        {!isLoading.runReport && (
          <code>
            <pre className="text-gray-500">
              {JSON.stringify(formState, null, 2)}
            </pre>
            <pre>{JSON.stringify(reportData, null, 2)}</pre>
          </code>
        )}
      </div>
    </div>
  );
}
