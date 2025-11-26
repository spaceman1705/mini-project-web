import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export async function createTransaction(
  token: string,
  payload: {
    eventId: string;
    ticketTypeId: string;
    quantity: number;
  },
) {
  try {
    if (!baseUrl) throw new Error("API URL not configured");

    const { data } = await axios.post(
      `${baseUrl}/transactions/checkout`,
      payload,
      {
        headers: getAuthHeader(token),
      },
    );

    return data;
  } catch (err) {
    console.error("createTransaction error:", err);
    throw err;
  }
}

export async function getOrganizerTransactions(token: string) {
  try {
    if (!baseUrl) throw new Error("API URL not configured");

    const { data } = await axios.get(`${baseUrl}/transactions/organizer`, {
      headers: getAuthHeader(token),
    });

    return data;
  } catch (err) {
    console.error("getOrganizerTransactions error:", err);
    throw err;
  }
}

export async function getTransactionDetail(
  token: string,
  transactionId: string,
) {
  try {
    if (!baseUrl) throw new Error("API URL not configured");

    const { data } = await axios.get(
      `${baseUrl}/transactions/${transactionId}`,
      {
        headers: getAuthHeader(token),
      },
    );

    return data;
  } catch (err) {
    console.error("getTransactionDetail error:", err);
    throw err;
  }
}

export async function acceptTransaction(token: string, transactionId: string) {
  try {
    if (!baseUrl) throw new Error("API URL not configured");

    const { data } = await axios.patch(
      `${baseUrl}/transactions/${transactionId}/accept`,
      {},
      {
        headers: getAuthHeader(token),
      },
    );

    return data;
  } catch (err) {
    console.error("acceptTransaction error:", err);
    throw err;
  }
}

export async function rejectTransaction(
  token: string,
  transactionId: string,
  reason?: string,
) {
  try {
    if (!baseUrl) throw new Error("API URL not configured");

    const { data } = await axios.patch(
      `${baseUrl}/transactions/${transactionId}/reject`,
      { reason },
      {
        headers: getAuthHeader(token),
      },
    );

    return data;
  } catch (err) {
    console.error("rejectTransaction error:", err);
    throw err;
  }
}
