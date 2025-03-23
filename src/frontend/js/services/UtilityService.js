const api = axios.create({ baseURL: "http://localhost:8386/api" });

class UtilityService {
  static async getAllUtilities(query = {}) {
    try {
      const response = await api.get("/utilities");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getUtilityImageById(id) {
    try {
      const response = await api.get(`/utility/image/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default UtilityService;
