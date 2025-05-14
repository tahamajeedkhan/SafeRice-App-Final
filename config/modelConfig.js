import Outline_Single_Grain from "../components/Outline_Single_Grain";

const modelConfig = {
  //baseIp: 'https://296d-202-47-38-13.ngrok-free.app',
  //baseIp: 'http://34.230.32.59',
  baseIp: 'http://192.168.18.8',
  ports: {
    health: '5000',
    disease: '5002',
    outline_Multi_Grain: '5001',
    outline_Single_Grain: '5004',
    rice_classification: '5003',
  },
  getUrl: (portName) => {
    return `${modelConfig.baseIp}:${modelConfig.ports[portName]}`;
  },
};

export default modelConfig;
