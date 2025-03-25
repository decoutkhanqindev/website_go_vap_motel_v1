import AuthService from "../services/AuthService.js";

const api = axios.create({ baseURL: "http://localhost:8386/api" });

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
      // Include the Authorization header conditionally
      const response = await api.get(`/rooms?${queryString}`, {
        headers: AuthService.authHeader() // Use the imported function
      });
      console.log("res", response);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getRoomById(id) {
    try {
      // Include the Authorization header conditionally
      const response = await api.get(`/room/${id}`, {
        headers: AuthService.authHeader()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getRoomImageById(id) {
    try {
      // Include the Authorization header conditionally
      const response = await api.get(`/room/image/${id}`, {
        headers: AuthService.authHeader()
      });
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

      // Include Authorization and Content-Type headers
      const response = await api.patch(`/room/${id}/images`, formData, {
        headers: {
          ...AuthService.authHeader(), // Merge auth header with other headers
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteImagesForRoom(id, imageIds) {
    try {
      // Include the Authorization header conditionally
      const response = await api.delete(`/room/${id}/images`, {
        headers: AuthService.authHeader(),
        data: { images: imageIds }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async addAmenitiesToRoom(id, amenityIds) {
    try {
      // Include the Authorization header conditionally
      const response = await api.patch(`/room/${id}/amenities`, {
        headers: AuthService.authHeader(),
        data: { amenities: amenityIds }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAmenitiesForRoom(id, amenityIds) {
    try {
      // Include the Authorization header conditionally
      const response = await api.delete(`/room/${id}/amenities`, {
        headers: AuthService.authHeader(),
        data: { amenities: amenityIds }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async addUtilitiesToRoom(id, utilityIds) {
    try {
      // Include the Authorization header conditionally
      const response = await api.patch(`/room/${id}/utilities`, {
        headers: AuthService.authHeader(),
        data: { utilities: utilityIds }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteUtilitiesForRoom(id, utilityIds) {
    try {
      // Include the Authorization header conditionally
      const response = await api.delete(`/room/${id}/utilities`, {
        headers: AuthService.authHeader(),
        data: { utilities: utilityIds }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async addNewRoom(data, imageFiles) {
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

      // Include Authorization and Content-Type headers
      const response = await api.post("/room", formData, {
        headers: {
          ...AuthService.authHeader(), // Merge auth header
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  static async updateRoom(id, data) {
    try {
      // Include the Authorization header conditionally
      const response = await api.put(`/room/${id}`, data, {
        headers: AuthService.authHeader()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteRoom(id) {
    try {
      // Include the Authorization header conditionally
      const response = await api.delete(`/room/${id}`, {
        headers: AuthService.authHeader()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default RoomService;
