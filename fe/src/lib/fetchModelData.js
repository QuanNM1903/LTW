/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 * @returns {Promise<any>}  A promise that resolves to the fetched data or null on error.
 */
function fetchModel(url) {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Fetch error:', error);
      return null;
    });
}

export default fetchModel;
