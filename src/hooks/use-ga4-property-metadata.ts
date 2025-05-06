import { useEffect, useState } from "react";

import useGapiContext from "@/contexts/useGapiContext";
import { listGA4ProperyMetadata } from "@/utils/gapi-utils";

type useGA4PropertyMetadataProps = {
  propertyId: number;
};

export default function useGA4PropertyMetadata({
  propertyId,
}: useGA4PropertyMetadataProps) {
  const { isGapiReady, accessToken } = useGapiContext();

  const [propertyMetadata, setPropertyMetadata] =
    useState<gapi.client.analyticsdata.Metadata | null>(null);
  const [isLoadingPropertyMetadata, setIsLoadingPropertyMetadata] =
    useState(false);

  useEffect(() => {
    async function fetchMetadata() {
      if (!isGapiReady) {
        console.error("GAPI is not ready");
        return;
      }
      setIsLoadingPropertyMetadata(true);
      try {
        const metadataResponse = await listGA4ProperyMetadata({
          accessToken: accessToken as gapi.client.TokenObject,
          propertyId: propertyId,
        });
        setPropertyMetadata(metadataResponse);
      } catch (error) {
        console.error("Error fetching property metadata:", error);
      } finally {
        setIsLoadingPropertyMetadata(false);
      }
    }
    fetchMetadata();
  }, [isGapiReady, accessToken, propertyId]);

  return { propertyMetadata, isLoadingPropertyMetadata };
}
