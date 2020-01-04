import React from 'react';

import {newContextComponents} from "drizzle-react-components";

const {ContractData} = newContextComponents;

class Automatricula extends React.Component {

    state = {
        ready: false,
        valueName: '',
        valueEmail: '',
        matriculasLengthKey: null,
        alumnoAddrsKeysContract: [],
        alumnoAddrsKeysReal: [],
        alumnoYaMatriculado: false,
        alumnoYaMatriculadoAddr: '',
    }

    constructor(props) {
        super(props);
        this.state = { ready: false,
                       valueName: '',
                       valueEmail: '',
                       matriculasLengthKey: null,
                       alumnoAddrsKeysContract: [],
                       alumnoAddrsKeysReal: [],
                       alumnoYaMatriculado: false,
                       alumnoYaMatriculadoAddr: '',
                       };
    
        this.handleChangeName = this.handleChangeName.bind(this);
        this.handleChangeEmail = this.handleChangeEmail.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    
    handleChangeName(event) {
        this.setState({valueName: event.target.value});
    }

    handleChangeEmail(event) {
        this.setState({valueEmail: event.target.value});
    }

    handleSubmit(event) {
        
        const {drizzle, drizzleState} = this.props;

        const instance = drizzle.contracts.Asignatura;

        instance.methods.automatricula(this.state.valueName, this.state.valueEmail).send({from: drizzleState.accounts[0]});
    }

    componentDidMount() {
        this.setState({ready: true});
    }

    componentDidUpdate(prevProps, prevState, snapshoot) {
        const {drizzle, drizzleState} = this.props;

        const instanceState = drizzleState.contracts.Asignatura;
        if (!instanceState || !instanceState.initialized) return;

        const instance = drizzle.contracts.Asignatura;

        //
        // Pedimos el número de matriculados
        //
        let changedMatriculasLengthKey = false;

        // Copiar el estado
        let {
            matriculasLengthKey
        } = JSON.parse(JSON.stringify(this.state));

        if (!matriculasLengthKey) {
            matriculasLengthKey = instance.methods.matriculasLength.cacheCall();
            changedMatriculasLengthKey = true;
        }

        if (changedMatriculasLengthKey) {
            this.setState({
                matriculasLengthKey
            });
        }

        let instanceMatriculasLength = instanceState.matriculasLength[matriculasLengthKey];
        let instanceMatriculasLengthValue = instanceMatriculasLength ? instanceMatriculasLength.value : '0';

        //
        // Recuperamos las direcciones de los matriculados (hay que "pasarlas")
        //
        let changedAlumnoAddrsKeys = false;

        // Copiar el estado
        let { alumnoAddrsKeysContract } = JSON.parse(JSON.stringify(this.state));

        // Añadir keys de las nuevas matriculas
        for (let i = alumnoAddrsKeysContract.length; i < instanceMatriculasLengthValue; i++) {
            alumnoAddrsKeysContract[i] = instance.methods.matriculas.cacheCall(i);
            changedAlumnoAddrsKeys = true;
        }

        if (changedAlumnoAddrsKeys) {
            this.setState({
                alumnoAddrsKeysContract
            });
        }

        //
        // Recuperamos las direcciones de los matriculados correctas
        //
        let changedAlumnoAddrsKeysReal = false; 

        // Copiar el estado
        let { alumnoAddrsKeysReal } = JSON.parse(JSON.stringify(this.state));

        // Añadir keys de las nuevas matriculas
        let addr = "";
        for (let i = 0; i < instanceMatriculasLengthValue; i++) {
            addr = instanceState.matriculas[alumnoAddrsKeysContract[i]];
            addr = addr ? addr.value : "";
            alumnoAddrsKeysReal[i] = addr;
            changedAlumnoAddrsKeysReal = true;
        }

        //
        // Comprobamos si ya estoy matriculado
        //
        let changedYaMatriculado = false; 

        // Copiar el estado
        let { alumnoYaMatriculado, alumnoYaMatriculadoAddr } = JSON.parse(JSON.stringify(this.state));
        

        for (let i = 0; i < alumnoAddrsKeysReal.length; i++) {
            if((alumnoAddrsKeysReal[i] === drizzleState.accounts[0])&&(!this.state.alumnoYaMatriculado)){
                if(alumnoYaMatriculadoAddr === ''){
                    alumnoYaMatriculadoAddr = alumnoAddrsKeysReal[i];
                }
                changedYaMatriculado =  true;
                alumnoYaMatriculado  = true;
            }
        }

        if (changedYaMatriculado) {
            this.setState({
                alumnoYaMatriculado,
                alumnoYaMatriculadoAddr
            });
        }
    }

    render() {
        const {drizzle, drizzleState} = this.props;

        const instanceState = drizzleState.contracts.Asignatura;
        if (!this.state.ready || !instanceState || !instanceState.initialized) {
            return <span>Initializing...</span>;
        }

        return (
            <section>
                <h1>Automatrícula</h1>
                {(!this.state.alumnoYaMatriculado)  &&
                    <div>
                        <form onSubmit={this.handleSubmit}>
                            <p>
                                <label>
                                    Nombre  
                                    <input type="text" value={this.state.valueName} onChange={this.handleChangeName}/>
                                </label>
                            </p>
                            <p>
                                <label>
                                    Email
                                    <input type="text" value={this.state.valueEmail} onChange={this.handleChangeEmail} />
                                </label>
                            </p>
                            {(this.state.valueName !== '' && this.state.valueEmail !== '')  &&
                                <input type="submit" value="Automatricularse" />
                            }                        
                        </form>
                    </div>
                }
                {(this.state.alumnoYaMatriculado)  &&
                    <div>
                        <p>
                            Usted ya está matriculado con los siguientes datos: 
                        </p>
                        <ContractData
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                            contract={"Asignatura"}
                            method={"datosAlumno"}
                            methodArgs={[this.state.alumnoYaMatriculadoAddr]}
                            render={datos => (
                            <>
                                <p>- Nombre: <b>{datos.nombre}</b></p>
                                <p>- Email: <b>{datos.email}</b></p>
                            </>
                        )}   
                        />
                        <p>
                            No puede volver a matricularse.
                        </p>
                    </div>
                }
            </section>
        );
    }
}

export default Automatricula;