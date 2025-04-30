export const adminLogin = async (credentials) => {
  const response = await fetch('http://localhost:8000/api/accounts/admin/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Admin login failed');
  }

  return response.json();
};