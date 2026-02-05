import { ITSVinofactClient, VinofactWinesResponse } from '../types/vinofact'

export const createVinofactClient = (locale: string, endpoint: string, token: string, profileSlug: string): ITSVinofactClient => {
  const defaultQueryParameters = {
    profileSlug,
    locales: [locale]
  }
  const fetchData = async (query: string, variables = {}) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({
          query,
          variables: { ...variables, ...defaultQueryParameters }
        })
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Invalid or missing Vinofact API Token.");
        throw new Error(`Vinofact API responded with status ${response.status}`);
      }

      const json = await response.json();
      const { data, errors } = json;

      // 2. Check for GraphQL logic errors
      if (errors) {
        console.error("Vinofact GraphQL Errors:", errors);
        throw new Error(errors[0]?.message || "Vinofact GraphQL query failed");
      }

      return data;
      
    } catch (err) {
      const error = err as Error
      // Network error or thrown above
      console.error("Vinofact API call failed:", err)
      // throw err
      throw error
    }
  }
  
  const getWines = async (): Promise<VinofactWinesResponse> => {
    const query = `
      query ($profileSlug: String!, $locales: [String!]!) {
        wines(profileSlug: $profileSlug, locales: $locales) {
          id
          slug
          title
          year
          editUrl
        }
      }
    `;

    return await fetchData(query);
  }

  return {
    getWines
  }
  
}