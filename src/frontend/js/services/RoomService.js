import api from "./axiosConfig.js";

class RoomService {
  static async getAllRooms(filter) {
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
      const response = await api.get(`/rooms?${queryString}`);
      // console.log("res", response); // Giữ lại nếu cần debug
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getRoomById(id) {
    try {
      // Không cần headers thủ công
      const response = await api.get(`/room/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getRoomImageById(id) {
    try {
      // Không cần headers thủ công
      const response = await api.get(`/room/image/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async addImagesToRoom(id, imageFiles) {
    try {
      const formData = new FormData();
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      // Axios tự xử lý Content-Type cho FormData
      // Interceptor xử lý Authorization
      const response = await api.patch(`/room/${id}/images`, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteImagesForRoom(id, imageIds) {
    try {
      // Không cần headers thủ công, data cho DELETE nằm trong config
      const response = await api.delete(`/room/${id}/images`, {
        data: { images: imageIds } // data cho DELETE
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async addAmenitiesToRoom(id, amenityIds) {
    try {
      // Sửa cú pháp: data là argument thứ 2 cho PATCH
      const response = await api.patch(`/room/${id}/amenities`, {
        amenities: amenityIds
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAmenitiesForRoom(id, amenityIds) {
    try {
      // Sửa cú pháp: data cho DELETE nằm trong config object (argument thứ 2)
      const response = await api.delete(`/room/${id}/amenities`, {
        data: { amenities: amenityIds }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async addUtilitiesToRoom(id, utilityIds) {
    try {
      // Sửa cú pháp: data là argument thứ 2 cho PATCH
      const response = await api.patch(`/room/${id}/utilities`, {
        utilities: utilityIds
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteUtilitiesForRoom(id, utilityIds) {
    try {
      // Sửa cú pháp: data cho DELETE nằm trong config object (argument thứ 2)
      const response = await api.delete(`/room/${id}/utilities`, {
        data: { utilities: utilityIds }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async addNewRoom(formData) {
    try {
      // Axios tự xử lý Content-Type cho FormData
      // Interceptor xử lý Authorization
      const response = await api.post("/room", formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateRoom(id, data) {
    try {
      // Không cần headers thủ công
      const response = await api.put(`/room/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteRoom(id) {
    try {
      // Không cần headers thủ công
      const response = await api.delete(`/room/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default RoomService;
