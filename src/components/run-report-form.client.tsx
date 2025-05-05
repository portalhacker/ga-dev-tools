"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import useGapiContext from "@/contexts/useGapiContext";
import {
  listGA4AccountSummaries,
  listGA4ProperyMetadata,
  runGA4Report,
} from "@/utils/gapi-utils";

export default function RunReportForm() {
  const searchParams = useSearchParams();
  const { isGapiReady, accessToken } = useGapiContext();

  const [formState, setFormState] = useState<{
    propertyId: number | null;
    dateRanges: gapi.client.analyticsdata.DateRange[];
    dimensions: gapi.client.analyticsdata.Dimension[] | null;
    metrics: gapi.client.analyticsdata.Metric[] | null;
  }>({
    propertyId: parseInt(searchParams.get("property_id") as string) || null,
    dateRanges: [
      {
        startDate: new Date(new Date().getTime() - 93 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        endDate: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
    ],
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
        console.log("Property ID is not set");
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
  }, [isGapiReady, accessToken, formState.propertyId]);

  return (
    <>
      <div className="flex gap-6">
        <div className="w-[50%]">
          <form className="mb-4 flex flex-col gap-4">
            <select
              value={formState.propertyId ?? ""}
              className="border-2"
              onChange={(e) => {
                const newPropertyId = parseInt(e.target.value);
                setFormState((prev) => ({
                  ...prev,
                  propertyId: newPropertyId,
                }));
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
                      {property.accountDisplayName}
                      {" --> "}
                      {property.displayName}
                    </option>
                  ))}
                </>
              )}
            </select>
            <input
              type="date"
              className="border-2"
              value={formState.dateRanges?.[0]?.startDate}
              onChange={(e) => {
                setFormState((prev) => ({
                  ...prev,
                  dateRanges: [
                    {
                      startDate: e.target.value,
                      endDate: prev.dateRanges?.[0]?.endDate,
                    },
                  ],
                }));
              }}
            />
            <input
              type="date"
              className="border-2"
              value={formState.dateRanges?.[0]?.endDate}
              onChange={(e) => {
                setFormState((prev) => ({
                  ...prev,
                  dateRanges: [
                    {
                      startDate: prev.dateRanges?.[0]?.startDate,
                      endDate: e.target.value,
                    },
                  ],
                }));
              }}
            />
            <select
              multiple
              className="h-40 border-2"
              onChange={(e) => {
                const selectedDimensions = Array.from(
                  e.target.selectedOptions,
                ).map((option) => ({
                  name: option.value,
                }));
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
                      {dimension.uiName} ({dimension.apiName})
                    </option>
                  ))}
                </>
              )}
            </select>
            <select
              multiple
              className="h-40 border-2"
              onChange={(e) => {
                const selectedMetrics = Array.from(
                  e.target.selectedOptions,
                ).map((option) => ({
                  name: option.value,
                }));
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
                      {metric.uiName} ({metric.apiName})
                    </option>
                  ))}
                </>
              )}
            </select>
            <button
              type="button"
              className={`rounded px-4 py-2 text-white ${isLoading.runReport ? "cursor-not-allowed hover:bg-gray-600" : "bg-blue-500 hover:cursor-pointer hover:bg-blue-600"}`}
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
          <code>
            <pre>{JSON.stringify(formState, null, 2)}</pre>
          </code>
        </div>
        {isLoading.runReport ? (
          <p>Loading...</p>
        ) : (
          <code>
            <pre>{JSON.stringify(reportData, null, 2)}</pre>
          </code>
        )}
      </div>
    </>
  );
}
