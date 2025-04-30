"use client";

import useGapiContext from "@/contexts/useGapiContext";
import * as gapiUtils from "@/utils/gapi-utils";
import { useState } from "react";

enum gapiUtilsFunctionName {
  listGA4AccountSummaries = "listGA4AccountSummaries",
  listGA4Accounts = "listGA4Accounts",
  listGA4ProperyMetadata = "listGA4ProperyMetadata",
  runGA4Report = "runGA4Report",
}

export default function GapiCaller() {
  const { isGapiReady, client, accessToken } = useGapiContext();
  const [functionName, setFunctionName] = useState<gapiUtilsFunctionName>(
    gapiUtilsFunctionName.listGA4AccountSummaries,
  );
  const [properyId, setProperyId] = useState<number>(456086743);
  const [response, setResponse] = useState<
    | gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaListAccountSummariesResponse
    | gapi.client.analyticsadmin.GoogleAnalyticsAdminV1betaListAccountsResponse
    | gapi.client.analyticsdata.Metadata
    | gapi.client.analyticsdata.RunReportResponse
    | null
  >(null);

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
      const response = await functionToCall({
        accessToken,
        properyId,
      });
      console.log("Response", response);
      setResponse(response);
    } catch (err) {
      console.error("Error executing GAPI call", err);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => client?.requestAccessToken()}
        className="rounded border px-4 py-2 hover:cursor-pointer hover:bg-gray-200"
      >
        Authorize with Google
      </button>
      <select
        value={functionName}
        onChange={(e) =>
          setFunctionName(e.target.value as gapiUtilsFunctionName)
        }
        className="rounded border px-4 py-2"
      >
        {Object.values(gapiUtilsFunctionName).map((func) => (
          <option key={func} value={func}>
            {func}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={properyId}
        onChange={(e) => setProperyId(Number(e.target.value))}
        className="rounded border px-4 py-2"
        placeholder="Property ID"
      />
      <button
        onClick={executeGapi}
        disabled={!accessToken}
        className="rounded border px-4 py-2 hover:cursor-pointer hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Execute
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
        <p className="text-red-500">Metadata is not set</p>
      )}
    </div>
  );
}
