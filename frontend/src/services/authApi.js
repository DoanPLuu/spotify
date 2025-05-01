export const adminLogin = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/api/accounts/admin/login/`, {  // Add /api prefix
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
