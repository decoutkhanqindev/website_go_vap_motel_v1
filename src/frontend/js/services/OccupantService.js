import api from "./axiosConfig.js";

class OccupantService {
  static async getAllOccupants(filter) {
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
      // Interceptor xử lý Authorization
      const response = await api.get(`/occupants?${queryString}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all occupants:", error);
      throw error;
    }
  }

  static async getOccupantById(id) {
    try {
      // Interceptor xử lý Authorization
      const response = await api.get(`/occupant/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching occupant with id ${id}:`, error);
      throw error;
    }
  }

  static async getOccupantCccdImageById(imageId) {
    try {
      // Interceptor xử lý Authorization
      const response = await api.get(`/occupant/cccdImage/${imageId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching occupant cccd image with id ${imageId}:`,
        error
      );
      throw error;
    }
  }

  static async addNewOccupant(formData) {
    try {
      // Axios tự xử lý Content-Type cho FormData
      // Interceptor xử lý Authorization
      const response = await api.post("/occupant", formData);
      return response.data;
    } catch (error) {
      console.error("Error adding new occupant:", error);
      throw error;
    }
  }

  static async updateOccupant(id, data) {
    try {
      // Interceptor xử lý Authorization
      // Content-Type mặc định là application/json
      const response = await api.put(`/occupant/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating occupant with id ${id}:`, error);
      throw error;
    }
  }

  static async deleteOccupant(id) {
    try {
      // Interceptor xử lý Authorization
      const response = await api.delete(`/occupant/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting occupant with id ${id}:`, error);
      throw error;
    }
  }

  static async addCccdImagesToOccupant(id, imageFiles) {
    try {
      const formData = new FormData();
      imageFiles.forEach((file) => {
        // Key phải khớp với key mà Multer mong đợi ở backend ('cccdImages')
        formData.append("cccdImages", file);
      });

      // Axios tự xử lý Content-Type cho FormData
      // Interceptor xử lý Authorization
      const response = await api.patch(`/occupant/${id}/cccdImages`, formData);
      return response.data;
    } catch (error) {
      console.error(
        `Error adding cccd images to occupant with id ${id}:`,
        error
      );
      throw error;
    }
  }

  static async deleteCccdImagesForOccupant(id, cccdImageIds) {
    try {
      // Interceptor xử lý Authorization
      // Data cho DELETE cần nằm trong config object
      const response = await api.delete(`/occupant/${id}/cccdImages`, {
        // Key phải khớp với key mà backend controller mong đợi ('cccdImages')
        data: { cccdImages: cccdImageIds }
      });
      return response.data;
    } catch (error) {
      console.error(
        `Error deleting cccd images for occupant with id ${id}:`,
        error
      );
      throw error;
    }
  }
}

export default OccupantService;
