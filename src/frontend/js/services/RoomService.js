const api = axios.create({ baseURL: "http://localhost:8386/api" });

class RoomService {
  static async getAllRooms(query) {
    try {
      const response = await api.get(`/rooms?${query}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getRoomImageById(id) {
    try {
      const response = await api.get(`/room/image/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default RoomService;
