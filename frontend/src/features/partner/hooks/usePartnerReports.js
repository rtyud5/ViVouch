import { useQuery } from "@tanstack/react-query";
import { getPartnerReports } from "../api/reports.api";

export const PARTNER_REPORTS_QUERY_KEY = ["partnerReports"];

export const usePartnerReports = (range) => {
  return useQuery({
    queryKey: [...PARTNER_REPORTS_QUERY_KEY, range],
    queryFn: () => getPartnerReports(range),
    enabled: !!range, 
  });
};
