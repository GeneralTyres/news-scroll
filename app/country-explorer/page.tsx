import { fetchCountryExplorerCountries } from "@/lib/services/countries/country.service";
import { CountryExplorerPageClient } from "@/components/country-explorer/CountryExplorerPageClient";

export const dynamic = "force-dynamic";

export default async function CountryExplorerPage() {
  const countries = await fetchCountryExplorerCountries();
  return <CountryExplorerPageClient countries={countries} />;
}
