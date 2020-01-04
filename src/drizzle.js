
// Importar el artefacto del contrato
import Asignatura from './contracts/Asignatura.json';

// Opciones de Drizzle:
const options = {
	contracts: [ Asignatura ],
    web3: {
    	fallback: {
    		type: "ws",
    		url: "ws://127.0.0.1:7545"
    	}
    }
};

export default options;
