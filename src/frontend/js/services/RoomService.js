const api = axios.create({ baseURL: "http://localhost:8386/api" });

class RoomService {
  static async getAllRooms(query = {}) {
    try {
      const response = await api.get("/rooms");
      return response.data;
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  }
}

export default RoomService;
