import fetchData from './fetchData';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

const fetchSelfDetails = async () => {
  const userData = await fetchData(`http://localhost:5000/users/self`, 'GET', {
    credentials: 'include',
  });
  return userData;
};

export default fetchSelfDetails;
