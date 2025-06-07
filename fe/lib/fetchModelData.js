const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function fetchModel(url) {
  const token = localStorage.getItem('jwt_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetch(`${API_BASE_URL}${url}`, { headers })
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