import api from "./axiosConfig.js";

class ExpenseService {
  static async getAllExpenses(filter) {
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
      const response = await api.get(`/expenses?${queryString}`);
      // console.log("res", response); // Giữ lại nếu cần debug
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getExpenseById(id) {
    try {
      // Không cần headers thủ công
      const response = await api.get(`/expense/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getExpenseReceiptImageById(id) {
    try {
      // Không cần headers thủ công
      const response = await api.get(`/expense/receiptImage/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async addReceiptImagesToExpense(id, imageFiles) {
    try {
      const formData = new FormData();
      imageFiles.forEach((file) => {
        formData.append("receiptImages", file);
      });

      // Axios tự xử lý Content-Type cho FormData
      // Interceptor xử lý Authorization
      const response = await api.patch(
        `/expense/${id}/receiptImages`,
        formData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteReceiptImagesForExpense(id, imageIds) {
    try {
      // Không cần headers thủ công, data cho DELETE nằm trong config
      const response = await api.delete(`/expense/${id}/receiptImages`, {
        data: { receiptImages: imageIds }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async addNewExpense(data, imageFiles) {
    try {
      const formData = new FormData();
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          formData.append(key, data[key]);
        }
      }

      if (imageFiles) {
        imageFiles.forEach((file) => {
          formData.append("receiptImages", file);
        });
      }

      // Axios tự xử lý Content-Type cho FormData
      // Interceptor xử lý Authorization
      const response = await api.post("/expense", formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateExpense(id, data) {
    try {
      // Không cần headers thủ công
      const response = await api.put(`/expense/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteExpense(id) {
    try {
      // Không cần headers thủ công
      const response = await api.delete(`/expense/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async markIsPaid(id, paymentMethod) {
    try {
      const response = await api.patch(`/expense/${id}/paid`, {
        paymentMethod: paymentMethod
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default ExpenseService;
