import api from "./axiosConfig.js";

class UtilityService {
  static async getAllUtilities() {
    try {
      // Không cần headers thủ công
      const response = await api.get("/utilities");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getUtilityById(id) {
    try {
      // Không cần headers thủ công
      const response = await api.get(`/utility/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getUtilityImageById(id) {
    try {
      // Không cần headers thủ công
      const response = await api.get(`/utility/image/${id}`);
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

      // Axios tự xử lý Content-Type cho FormData
      // Interceptor xử lý Authorization
      const response = await api.patch(`/utility/${id}/images`, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteImagesForUtility(id, imageIds) {
    try {
      // Không cần headers thủ công, data cho DELETE nằm trong config
      const response = await api.delete(`/utility/${id}/images`, {
        data: { images: imageIds } // data cho DELETE
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

      // Axios tự xử lý Content-Type cho FormData
      // Interceptor xử lý Authorization
      const response = await api.post("/utility", formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateUtility(id, data) {
    try {
      // Không cần headers thủ công
      const response = await api.put(`/utility/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteUtility(id) {
    try {
      // Không cần headers thủ công
      const response = await api.delete(`/utility/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default UtilityService;
