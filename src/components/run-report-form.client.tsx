"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import useGA4AccountSummaries from "@/hooks/use-ga4-account-summaries";
import useGA4PropertyMetadata from "@/hooks/use-ga4-property-metadata";
import useGA4ReportData from "@/hooks/use-ga4-run-report";

export default function RunReportForm() {
  const searchParams = useSearchParams();

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
  const { propertiesSummaries, isLoadingAccountSummaries } =
    useGA4AccountSummaries();
  const { propertyMetadata, isLoadingPropertyMetadata } =
    useGA4PropertyMetadata({
      propertyId: formState.propertyId as number,
    });
  const { reportData, isLoadingReportData } = useGA4ReportData({
    propertyId: formState.propertyId as number,
    dateRanges: formState.dateRanges,
    dimensions: formState.dimensions,
    metrics: formState.metrics,
  });

  return (
    <>
      <div className="flex gap-6">
        <div className="w-1/3">
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
              {isLoadingAccountSummaries.propertiesSummaries ? (
                <option>Loading...</option>
              ) : (
                <>
                  <option value="">Select Property</option>
                  {propertiesSummaries?.map((property) => (
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
              {isLoadingPropertyMetadata ? (
                <option>Loading...</option>
              ) : (
                <>
                  {propertyMetadata?.dimensions?.map((dimension) => (
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
              {isLoadingPropertyMetadata ? (
                <option>Loading...</option>
              ) : (
                <>
                  {propertyMetadata?.metrics?.map((metric) => (
                    <option key={metric.apiName} value={metric.apiName}>
                      {metric.uiName} ({metric.apiName})
                    </option>
                  ))}
                </>
              )}
            </select>
          </form>
          <code>
            <pre>{JSON.stringify(formState, null, 2)}</pre>
          </code>
        </div>
        {isLoadingReportData ? (
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
