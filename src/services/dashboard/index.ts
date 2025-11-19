import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

// Helper to get auth header
const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

//CUSTOMER DASHBOARD
export async function getCustomerStats(token: string) {
  try {
    const { data } = await axios.get(`${baseUrl}/dashboard/customer/stats`, {
      headers: getAuthHeader(token),
    });
    return data;
  } catch (err) {
    console.error("getCustomerStats error:", err);
    throw err;
  }
}

export async function getCustomerUpcomingEvents(token: string) {
  try {
    const { data } = await axios.get(
      `${baseUrl}/dashboard/customer/upcoming-events`,
      {
        headers: getAuthHeader(token),
      },
    );
    return data;
  } catch (err) {
    console.error("getCustomerUpcomingEvents error:", err);
    throw err;
  }
}

export async function getCustomerRecentActivity(token: string) {
  try {
    const { data } = await axios.get(
      `${baseUrl}/dashboard/customer/recent-activity`,
      {
        headers: getAuthHeader(token),
      },
    );
    return data;
  } catch (err) {
    console.error("getCustomerRecentActivity error:", err);
    throw err;
  }
}

//ORGANIZER DASHBOARD
export async function getOrganizerStats(token: string) {
  try {
    const { data } = await axios.get(`${baseUrl}/dashboard/organizer/stats`, {
      headers: getAuthHeader(token),
    });
    return data;
  } catch (err) {
    console.error("getOrganizerStats error:", err);
    throw err;
  }
}

export async function getOrganizerEvents(token: string) {
  try {
    const { data } = await axios.get(`${baseUrl}/dashboard/organizer/events`, {
      headers: getAuthHeader(token),
    });
    return data;
  } catch (err) {
    console.error("getOrganizerEvents error:", err);
    throw err;
  }
}

export async function getOrganizerWeeklySales(token: string) {
  try {
    const { data } = await axios.get(
      `${baseUrl}/dashboard/organizer/weekly-sales`,
      {
        headers: getAuthHeader(token),
      },
    );
    return data;
  } catch (err) {
    console.error("getOrganizerWeeklySales error:", err);
    throw err;
  }
}

//ADMIN DASHBOARD

export async function getAdminStats(token: string) {
  try {
    const { data } = await axios.get(`${baseUrl}/dashboard/admin/stats`, {
      headers: getAuthHeader(token),
    });
    return data;
  } catch (err) {
    console.error("getAdminStats error:", err);
    throw err;
  }
}

export async function getAdminRecentUsers(token: string, limit: number = 10) {
  try {
    const { data } = await axios.get(
      `${baseUrl}/dashboard/admin/recent-users?limit=${limit}`,
      {
        headers: getAuthHeader(token),
      },
    );
    return data;
  } catch (err) {
    console.error("getAdminRecentUsers error:", err);
    throw err;
  }
}

export async function getAdminPendingEvents(token: string) {
  try {
    const { data } = await axios.get(
      `${baseUrl}/dashboard/admin/pending-events`,
      {
        headers: getAuthHeader(token),
      },
    );
    return data;
  } catch (err) {
    console.error("getAdminPendingEvents error:", err);
    throw err;
  }
}

export async function getAdminUserGrowth(token: string) {
  try {
    const { data } = await axios.get(`${baseUrl}/dashboard/admin/user-growth`, {
      headers: getAuthHeader(token),
    });
    return data;
  } catch (err) {
    console.error("getAdminUserGrowth error:", err);
    throw err;
  }
}

export async function approveEvent(token: string, eventId: string) {
  try {
    const { data } = await axios.patch(
      `${baseUrl}/dashboard/admin/events/${eventId}/approve`,
      {},
      { headers: getAuthHeader(token) },
    );
    return data;
  } catch (err) {
    console.error("approveEvent error:", err);
    throw err;
  }
}

export async function rejectEvent(token: string, eventId: string) {
  try {
    const { data } = await axios.patch(
      `${baseUrl}/dashboard/admin/events/${eventId}/reject`,
      {},
      { headers: getAuthHeader(token) },
    );
    return data;
  } catch (err) {
    console.error("rejectEvent error:", err);
    throw err;
  }
}
