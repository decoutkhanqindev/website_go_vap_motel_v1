const api = axios.create({ baseURL: "http://localhost:8386/api" });

class AmenityService {
  static async getAllAmenities(query = {}) {
    try {
      const response = await api.get("/amenities");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getAmenityImageById(id) {
    try {
      const response = await api.get(`/amenity/image/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default AmenityService;
