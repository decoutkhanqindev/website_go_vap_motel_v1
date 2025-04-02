import api from "./axiosConfig.js";

class ContractService {
  static async getAllContracts(filter) {
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
      const response = await api.get(`/contracts?${queryString}`);
      // console.log("res", response); // Giữ lại nếu cần debug
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getContractById(id) {
    try {
      // Không cần headers thủ công
      const response = await api.get(`/contract/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async addNewContract(data) {
    try {
      const response = await api.post("/contract", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateContract(id, data) {
    try {
      // Không cần headers thủ công
      const response = await api.put(`/contract/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteContract(id) {
    try {
      // Không cần headers thủ công
      const response = await api.delete(`/contract/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async extendContract(id, newEndDate) {
    try {
      // Không cần headers thủ công
      const response = await api.patch(`/contract/${id}/extend`, {
        endDate: newEndDate
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async terminateContract(id) {
    try {
      // Không cần headers thủ công
      const response = await api.patch(`/contract/${id}/terminate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default ContractService;
