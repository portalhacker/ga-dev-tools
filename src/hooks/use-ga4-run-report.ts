import { useEffect, useState } from "react";

import useGapiContext from "@/contexts/useGapiContext";
import { runGA4Report } from "@/utils/gapi-utils";

type useGA4ReportDataProps = {
  propertyId: number;
  dateRanges: gapi.client.analyticsdata.DateRange[];
  dimensions: gapi.client.analyticsdata.Dimension[] | null;
  metrics: gapi.client.analyticsdata.Metric[] | null;
};

export default function useGA4ReportData({
  propertyId,
  dateRanges,
  dimensions,
  metrics,
}: useGA4ReportDataProps) {
  const { isGapiReady, accessToken } = useGapiContext();

  const [reportData, setReportData] =
    useState<gapi.client.analyticsdata.RunReportResponse | null>(null);
  const [isLoadingReportData, setIsLoadingReportData] = useState(false);

  useEffect(() => {
    async function fetchReportData() {
      if (!isGapiReady) {
        console.error("GAPI is not ready");
        return;
      }
      setIsLoadingReportData(true);
      try {
        const reportResponse = await runGA4Report({
          accessToken: accessToken as gapi.client.TokenObject,
          propertyId,
          dateRanges,
          dimensions: dimensions ?? [],
          metrics: metrics ?? [],
        });
        setReportData(reportResponse);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setIsLoadingReportData(false);
      }
    }
    if (propertyId && dateRanges && metrics) {
      fetchReportData();
    }
  }, [isGapiReady, accessToken, propertyId, dateRanges, dimensions, metrics]);

  return { reportData, isLoadingReportData };
}
