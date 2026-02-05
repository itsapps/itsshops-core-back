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

      const { data, errors } = await response.json();
      if (errors) {
        console.error("Vinofact GraphQL Errors:", errors);
        throw new Error("Vinofact GraphQL query failed");
      }

      return data;
      
    } catch (err) {
      const error = err as Error
      // Network error or thrown above
      console.error("Vinofact API call failed:", err)
      // throw err
      return {error: error.message}
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