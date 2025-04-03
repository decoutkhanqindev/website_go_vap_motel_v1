import api from "./axiosConfig.js";

class InvoiceService {
  static async getAllInvoices(filter) {
    try {
      const queryParams = new URLSearchParams();
      for (const key in filter) {
        if (
          filter.hasOwnProperty(key) &&
          filter[key] !== undefined &&
          filter[key] !== null
        ) {
          queryParams.append(key, filter[key]);
        }
      }
      const queryString = queryParams.toString();
      // Không cần headers thủ công
      const response = await api.get(`/invoices?${queryString}`);
      // console.log("res", response); // Giữ lại nếu cần debug
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getInvoiceById(id) {
    try {
      // Không cần headers thủ công
      const response = await api.get(`/invoice/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async addNewInvoice(data) {
    try {
      const response = await api.post("/invoice", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateInvoice(id, data) {
    try {
      // Không cần headers thủ công
      const response = await api.put(`/invoice/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteInvoice(id) {
    try {
      // Không cần headers thủ công
      const response = await api.delete(`/invoice/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async markIsPaid(id, paymentMethod) {
    try {
      const response = await api.patch(`/invoice/${id}/paid`, {
        paymentMethod: paymentMethod
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default InvoiceService;
