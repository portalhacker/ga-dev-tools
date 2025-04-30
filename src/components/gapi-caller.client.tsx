"use client";

import { useRouter, useSearchParams } from "next/navigation";

import useGapiContext from "@/contexts/useGapiContext";
import * as gapiUtils from "@/utils/gapi-utils";
import { useEffect, useState } from "react";

enum gapiUtilsFunctionName {
  listGA4AccountSummaries = "listGA4AccountSummaries",
  listGA4Accounts = "listGA4Accounts",
  listGA4ProperyMetadata = "listGA4ProperyMetadata",
  runGA4Report = "runGA4Report",
}

export default function GapiCaller() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const properyIdParam = Number(searchParams.get("property_id")) || null;
  const { isGapiReady, client, accessToken } = useGapiContext();
  const [functionName, setFunctionName] = useState<gapiUtilsFunctionName>(
    gapiUtilsFunctionName.listGA4AccountSummaries,
  );
  const [properyId, setProperyId] = useState<number>(
    properyIdParam || 456086743,
  );
  const [response, setResponse] = useState<
    | gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaListAccountSummariesResponse
    | gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaListAccountsResponse
    | gapi.client.analyticsdata.Metadata
    | gapi.client.analyticsdata.RunReportResponse
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountSummaries, setAccountSummaries] = useState<
    gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaAccountSummary[] | null
  >(null);

  useEffect(() => {
    const fetchAccountSummaries = async () => {
      if (!isGapiReady) {
        console.error("GAPI is not ready");
        return;
      }
      const accountSummariesResponse = await gapiUtils.listGA4AccountSummaries({
        accessToken: accessToken as gapi.client.TokenObject,
      });
      console.log("Account summaries response", accountSummariesResponse);
      setAccountSummaries(accountSummariesResponse.accountSummaries || null);
    };
    fetchAccountSummaries();
  }, [isGapiReady]);
  const properties = accountSummaries
    ?.flatMap((accountSummary) =>
      accountSummary.propertySummaries?.map((propertySummary) => ({
        ...propertySummary,
        accountDisplayName: accountSummary.displayName || "Unknown Account",
      })),
    )
    .filter((property) => property !== undefined);
  console.log("Properties", properties);

  function updateSearchParams(newPropertyId: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("property_id", newPropertyId.toString());
    router.push(`?${params.toString()}`);
  }

  function handlePropertyIdChange(newPropertyId: number) {
    setProperyId(newPropertyId);
    updateSearchParams(newPropertyId);
  }

  async function executeGapi(): Promise<void> {
    if (!isGapiReady || !client) {
      console.error("GAPI client is not initialized");
      return;
    }
    if (!accessToken) {
      console.error("Access token is not set");
      return;
    }

    let functionToCall;
    switch (functionName) {
      case gapiUtilsFunctionName.listGA4AccountSummaries:
        functionToCall = gapiUtils.listGA4AccountSummaries;
        break;
      case gapiUtilsFunctionName.listGA4Accounts:
        functionToCall = gapiUtils.listGA4Accounts;
        break;
      case gapiUtilsFunctionName.listGA4ProperyMetadata:
        functionToCall = gapiUtils.listGA4ProperyMetadata;
        break;
      case gapiUtilsFunctionName.runGA4Report:
        functionToCall = gapiUtils.runGA4Report;
        break;
      default:
        console.error("Invalid function name");
        return;
    }

    try {
      setIsLoading(true);
      const response = await functionToCall({
        accessToken,
        properyId,
      });
      console.log("Response", response);
      setResponse(response);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error executing GAPI call", err);
      setIsLoading(false);
      setResponse(null);
      setError("Error executing GAPI call: " + (err as Error).message);
      throw new Error("Error executing GAPI call");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <select
        value={functionName}
        onChange={(e) =>
          setFunctionName(e.target.value as gapiUtilsFunctionName)
        }
        className="rounded border px-4 py-2 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
      >
        {Object.values(gapiUtilsFunctionName).map((func) => (
          <option key={func} value={func}>
            {func}
          </option>
        ))}
      </select>
      <select
        value={properyId}
        onChange={(e) => handlePropertyIdChange(Number(e.target.value))}
        className="rounded border px-4 py-2 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
      >
        {properties?.length === 0 ? (
          <option value={0} disabled>
            No properties available
          </option>
        ) : (
          <>
            {properties?.map((property) => (
              <option
                key={property.property?.split("/")[1]}
                value={property.property?.split("/")[1]}
              >
                {property.accountDisplayName} - {property.displayName}
              </option>
            ))}
          </>
        )}
      </select>
      <button
        onClick={executeGapi}
        disabled={!accessToken || isLoading}
        className="rounded border px-4 py-2 hover:cursor-pointer hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800"
      >
        {isLoading ? "Loading..." : "Execute"}
      </button>
      {isGapiReady ? (
        <p className="text-green-500">GAPI is ready</p>
      ) : (
        <p className="text-red-500">GAPI is not ready</p>
      )}
      {accessToken ? (
        <p className="text-green-500">Access token is set</p>
      ) : (
        <p className="text-red-500">Access token is not set</p>
      )}
      {response ? (
        <pre className="text-green-500">
          <code>{JSON.stringify(response, null, 2)}</code>
        </pre>
      ) : (
        <p className="text-red-500">Data not fetched</p>
      )}
    </div>
  );
}
