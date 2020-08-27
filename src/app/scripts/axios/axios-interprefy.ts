import axios from "axios";

export default axios.create({
  baseURL: "https://interprefy-api.azurewebsites.net/api/"
});
