import { useContext } from "react";
import { GapiContext } from "./GapiContext";

export default function useGapiContext() {
  const context = useContext(GapiContext);
  if (!context) {
    throw new Error("useGapiContext must be used within a GapiProvider");
  }
  return context;
}
