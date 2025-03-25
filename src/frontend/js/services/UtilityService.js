import AuthService from "../services/AuthService.js"; // Import AuthService

const api = axios.create({
  baseURL: "http://localhost:8386/api",
  withCredentials: true
});

class UtilityService {
  static async getAllUtilities() {
    try {
      const response = await api.get("/utilities", {
        headers: AuthService.authHeader()
      }); // Add auth header
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getUtilityById(id) {
    try {
      const response = await api.get(`/utility/${id}`, {
        headers: AuthService.authHeader()
      }); // Add auth header
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getUtilityImageById(id) {
    try {
      const response = await api.get(`/utility/image/${id}`, {
        headers: AuthService.authHeader()
      }); // Add auth header
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async addImagesToUtility(id, imageFiles) {
    try {
      const formData = new FormData();
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await api.patch(`/utility/${id}/images`, formData, {
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

  static async deleteImagesForUtility(id, imageIds) {
    try {
      const response = await api.delete(`/utility/${id}/images`, {
        headers: AuthService.authHeader(), // Add auth header
        data: { images: imageIds }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  static async addNewUtility(data, imageFiles) {
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

      const response = await api.post("/utility", formData, {
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

  static async updateUtility(id, data) {
    try {
      const response = await api.put(`/utility/${id}`, data, {
        headers: AuthService.authHeader()
      }); // Add auth header
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteUtility(id) {
    try {
      const response = await api.delete(`/utility/${id}`, {
        headers: AuthService.authHeader()
      }); // Add auth header
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default UtilityService;
