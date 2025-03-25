import AuthService from "../services/AuthService.js"; // Import AuthService

const api = axios.create({
  baseURL: "http://localhost:8386/api",
  withCredentials: true
});

class AmenityService {
  static async getAllAmenities() {
    try {
      const response = await api.get("/amenities", {
        headers: AuthService.authHeader()
      }); // Add auth header
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  static async getAmenityById(id) {
    try {
      const response = await api.get(`/amenity/${id}`, {
        headers: AuthService.authHeader()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getAmenityImageById(id) {
    try {
      const response = await api.get(`/amenity/image/${id}`, {
        headers: AuthService.authHeader()
      }); // Add auth header
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  static async addImagesToAmenity(id, imageFiles) {
    try {
      const formData = new FormData();
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await api.patch(`/amenity/${id}/images`, formData, {
        headers: {
          ...AuthService.authHeader(), // Include existing auth headers
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteImagesForAmenity(id, imageIds) {
    try {
      const response = await api.delete(`/amenity/${id}/images`, {
        headers: AuthService.authHeader(), // Add auth header
        data: { images: imageIds }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  static async addNewAmenity(data, imageFiles) {
    try {
      const formData = new FormData();
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          formData.append(key, data[key]);
        }
      }

      if (imageFiles) {
        imageFiles.forEach((file) => {
          formData.append("images", file);
        });
      }

      const response = await api.post("/amenity", formData, {
        headers: {
          ...AuthService.authHeader(), // Include existing auth headers
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateAmenity(id, data) {
    try {
      const response = await api.put(`/amenity/${id}`, data, {
        headers: AuthService.authHeader()
      }); // Add auth header
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAmenity(id) {
    try {
      const response = await api.delete(`/amenity/${id}`, {
        headers: AuthService.authHeader()
      }); // Add auth header
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default AmenityService;
