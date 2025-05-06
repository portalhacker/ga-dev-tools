import { useEffect, useState } from "react";

import useGapiContext from "@/contexts/useGapiContext";
import { listGA4AccountSummaries } from "@/utils/gapi-utils";

export default function useGA4AccountSummaries() {
  const { isGapiReady, accessToken } = useGapiContext();
  const [accountSummaries, setAccountSummaries] = useState<
    gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaAccountSummary[] | null
  >(null);
  const [propertiesSummaries, setPropertiesSummaries] = useState<
    | (gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaPropertySummary & {
        accountDisplayName: string;
      })[]
    | null
  >(null);
  const [isLoadingAccountSummaries, setIsLoadingAccountSummaries] = useState({
    accountSummaries: false,
    propertiesSummaries: false,
  });
  useEffect(() => {
    async function fetchAccountSummaries() {
      if (!isGapiReady) {
        console.error("GAPI is not ready");
        return;
      }
      setIsLoadingAccountSummaries((prev) => ({
        accountSummaries: true,
        propertiesSummaries: true,
      }));
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
      setAccountSummaries(accountSummariesResponse.accountSummaries ?? null);
      setPropertiesSummaries(properties ?? null);
      setIsLoadingAccountSummaries({
        accountSummaries: false,
        propertiesSummaries: false,
      });
    }
    fetchAccountSummaries();
  }, [isGapiReady, accessToken]);

  return { accountSummaries, propertiesSummaries, isLoadingAccountSummaries };
}
