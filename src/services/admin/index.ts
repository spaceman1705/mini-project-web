import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

//EVENT MANAGEMENT

export async function getAllEvents(token: string) {
  try {
    if (!baseUrl) throw new Error("API URL not configured");

    const { data } = await axios.get(`${baseUrl}/admin/events`, {
      headers: getAuthHeader(token),
    });
    return data;
  } catch (err) {
    console.error("getallevent error:", err);
    throw err;
  }
}

export async function getEventById(token: string, eventId: string) {
  try {
    if (!baseUrl) throw new Error("API URL not configured");

    const { data } = await axios.get(`${baseUrl}/admin/events/${eventId}`, {
      headers: getAuthHeader(token),
    });
    return data;
  } catch (err) {
    console.error("geteventbyid error:", err);
    throw err;
  }
}

export async function approveEvent(token: string, eventId: string) {
  try {
    if (!baseUrl) throw new Error("API URL not configured");

    const { data } = await axios.patch(
      `${baseUrl}/admin/events/${eventId}/approve`,
      {},
      { headers: getAuthHeader(token) },
    );
    return data;
  } catch (err) {
    console.error("approveevent error:", err);
    throw err;
  }
}

export async function rejectEvent(token: string, eventId: string) {
  try {
    if (!baseUrl) throw new Error("API URL not configured");

    const { data } = await axios.patch(
      `${baseUrl}/admin/events/${eventId}/reject`,
      {},
      { headers: getAuthHeader(token) },
    );
    return data;
  } catch (err) {
    console.error("rejectevent error:", err);
    throw err;
  }
}

export async function deleteEvent(token: string, eventId: string) {
  try {
    if (!baseUrl) throw new Error("API URL not configured");

    const { data } = await axios.delete(`${baseUrl}/admin/events/${eventId}`, {
      headers: getAuthHeader(token),
    });
    return data;
  } catch (err) {
    console.error("deleteevent error:", err);
    throw err;
  }
}

//USER MANAGEMENT

export async function getAllUsers(token: string) {
  try {
    if (!baseUrl) {
      throw new Error("API URL not configured");
    }

    console.log("Fetching from URL:", `${baseUrl}/admin/users`);
    console.log("Token (first 20 chars):", token.substring(0, 20) + "...");

    const { data } = await axios.get(`${baseUrl}/admin/users`, {
      headers: getAuthHeader(token),
    });

    console.log("getAllUsers response:", data);
    return data;
  } catch (err: unknown) {
    console.error("getAllUsers error:", err);

    if (axios.isAxiosError(err)) {
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      // Throw dengan info lebih lengkap
      const respData = err.response?.data as unknown;
      if (
        respData &&
        typeof (respData as { message?: unknown }).message === "string"
      ) {
        throw new Error((respData as { message: string }).message);
      }
    }

    throw err;
  }
}

export async function updateUserRole(
  token: string,
  userId: string,
  role: string,
) {
  try {
    if (!baseUrl) {
      throw new Error("API URL not configured");
    }

    const { data } = await axios.patch(
      `${baseUrl}/admin/users/${userId}/role`,
      { role },
      {
        headers: getAuthHeader(token),
      },
    );
    return data;
  } catch (err: unknown) {
    console.error("updateUserRole error:", err);

    if (axios.isAxiosError(err)) {
      const respData = err.response?.data as unknown;
      if (
        respData &&
        typeof (respData as { message?: unknown }).message === "string"
      ) {
        throw new Error((respData as { message: string }).message);
      }
    }

    throw err;
  }
}

export async function deleteUser(token: string, userId: string) {
  try {
    if (!baseUrl) {
      throw new Error("API URL not configured");
    }

    const { data } = await axios.delete(`${baseUrl}/admin/users/${userId}`, {
      headers: getAuthHeader(token),
    });
    return data;
  } catch (err: unknown) {
    console.error("deleteUser error:", err);

    if (axios.isAxiosError(err)) {
      const respData = err.response?.data as unknown;
      if (
        respData &&
        typeof (respData as { message?: unknown }).message === "string"
      ) {
        throw new Error((respData as { message: string }).message);
      }
    }

    throw err;
  }
}

//TRANSACTION MANAGEMENT

export async function getAllTransactions(token: string) {
  try {
    if (!baseUrl) throw new Error("API URL not configured");

    const { data } = await axios.get(`${baseUrl}/admin/transactions`, {
      headers: getAuthHeader(token),
    });
    return data;
  } catch (err) {
    console.error("getalltransactiont error:", err);
    throw err;
  }
}

export async function getTransactionById(token: string, transactionId: string) {
  try {
    if (!baseUrl) throw new Error("API URL not configured");

    const { data } = await axios.get(
      `${baseUrl}/admin/transactions/${transactionId}`,
      {
        headers: getAuthHeader(token),
      },
    );
    return data;
  } catch (err) {
    console.error("gettransactiontbyid error:", err);
    throw err;
  }
}

export async function updateTransactionStatus(
  token: string,
  transactionId: string,
  status: string,
) {
  try {
    if (!baseUrl) throw new Error("API URL not configured");

    const { data } = await axios.patch(
      `${baseUrl}/admin/transactions/${transactionId}/status`,
      { status },
      { headers: getAuthHeader(token) },
    );
    return data;
  } catch (err) {
    console.error("updatetransactiontstatus error:", err);
    throw err;
  }
}
