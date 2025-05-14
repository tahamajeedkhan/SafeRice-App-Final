import Outline_Multi_Grain from "../components/Outline_Multi_Grain";

const config = {
  //baseIp: 'https://296d-202-47-38-13.ngrok-free.app',
  baseIp: 'http://34.230.32.59',
  //baseIp: 'http://192.168.18.8',
  ports: {
    database: '5001',
    //health: '5000',
    //disease: '5002',
    //rice_classification: '5003',
    outline_Multi_Grain: '5003',
    outline_Single_Grain: '5002',
    nutrition_extract_single_grain: '5004',
    nutrition_extract_multi_grain: '5005',
  },
  getUrl: (portName) => {
    return `${config.baseIp}:${config.ports[portName]}`;
  },
};

export default config;
