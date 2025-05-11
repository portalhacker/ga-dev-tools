import { useEffect, useState } from "react";

import useGapiContext from "@/contexts/useGapiContext";
import { sortArrayByProperties } from "@/lib/utils";
import { listGA4AccountSummaries } from "@/utils/gapi-utils";

type customGoogleAnalyticsPropertySummary =
  gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaPropertySummary & {
    accountDisplayName: string;
  };

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
      const accountSummaries = await listGA4AccountSummaries({
        accessToken: accessToken as gapi.client.TokenObject,
      });
      const sortedAccountSummaries: gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaAccountSummary[] =
        sortArrayByProperties(accountSummaries, ["displayName"]);
      // console.log("Account summaries response", sortedAccountSummaries);
      const properties = sortedAccountSummaries
        ?.flatMap((accountSummary) =>
          accountSummary.propertySummaries?.map((propertySummary) => ({
            ...propertySummary,
            accountDisplayName: accountSummary.displayName,
          })),
        )
        ?.filter(
          (property): property is customGoogleAnalyticsPropertySummary =>
            property !== undefined,
        );
      const sortedProperties = sortArrayByProperties(properties, [
        "accountDisplayName",
        "displayName",
      ]) as customGoogleAnalyticsPropertySummary[];
      // console.log("Properties", properties);
      setAccountSummaries(sortedAccountSummaries ?? null);
      setPropertiesSummaries(sortedProperties ?? null);
      setIsLoadingAccountSummaries({
        accountSummaries: false,
        propertiesSummaries: false,
      });
    }
    fetchAccountSummaries();
  }, [isGapiReady, accessToken]);

  return { accountSummaries, propertiesSummaries, isLoadingAccountSummaries };
}
