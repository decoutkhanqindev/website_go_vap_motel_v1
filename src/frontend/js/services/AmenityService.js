import api from "./axiosConfig.js";

class AmenityService {
  static async getAllAmenities() {
    try {
      // Không cần headers thủ công, interceptor sẽ xử lý
      const response = await api.get("/amenities");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getAmenityById(id) {
    try {
      // Không cần headers thủ công
      const response = await api.get(`/amenity/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getAmenityImageById(id) {
    try {
      // Không cần headers thủ công
      const response = await api.get(`/amenity/image/${id}`);
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

      // Axios tự xử lý Content-Type cho FormData
      // Interceptor xử lý Authorization
      const response = await api.patch(`/amenity/${id}/images`, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteImagesForAmenity(id, imageIds) {
    try {
      // Không cần headers thủ công, data cho DELETE nằm trong config
      const response = await api.delete(`/amenity/${id}/images`, {
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

      // Axios tự xử lý Content-Type cho FormData
      // Interceptor xử lý Authorization
      const response = await api.post("/amenity", formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateAmenity(id, data) {
    try {
      // Không cần headers thủ công
      const response = await api.put(`/amenity/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAmenity(id) {
    try {
      // Không cần headers thủ công
      const response = await api.delete(`/amenity/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default AmenityService;
