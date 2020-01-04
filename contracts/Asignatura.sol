pragma solidity >=0.5.12 <0.6.0;

contract Asignatura {
    
    /// address del profesor que ha desplegado el contrato
    address public profesor;
    
    string public nombre;
    string public curso;
    
    struct Evaluacion {
        string nombre;
        uint fecha;
        uint puntos;
    }
    
    Evaluacion[] public evaluaciones;

    struct DatosAlumno {
        string nombre;
        string email;
    }
    
    mapping (address => DatosAlumno) public datosAlumno;
    
    // Array con las direcciones de los alumnos amtriculados
    address[] public matriculas;
    
    
    enum TipoNota { NP, Normal, MH }
    
    struct Nota {
        TipoNota tipo;
        uint calificacion;
    }
    
    
    // Dada la direccion de un alumno, y el indice de la evaluacion, devuelve
    // la nota del alumno.
    mapping (address => mapping (uint => Nota)) public calificaciones;
    
    
    constructor(string memory _nombre, string memory _curso) public {
        
        profesor = msg.sender;
        nombre = _nombre;
        curso = _curso;
    }
    
    
    function evaluacionesLength() public view returns(uint) {
        return evaluaciones.length;
    }
    
    function creaEvaluacion(string memory _nombre, uint _fecha, uint _puntos) soloProfesor public returns (uint) {
        evaluaciones.push(Evaluacion(_nombre, _fecha, _puntos));
        return evaluaciones.length - 1;
    }
    
    
    function matriculasLength() public view returns(uint) {
        return matriculas.length;
    }
    
    function automatricula(string memory _nombre, string memory _email) noMatriculados public {
        
        bytes memory b = bytes(_nombre);
        require(b.length != 0, "El nombre no puede ser vacio");
        
        DatosAlumno memory datos = DatosAlumno(_nombre, _email);
        
        datosAlumno[msg.sender] = datos;
        
        matriculas.push(msg.sender);
        
    }
    
    function quienSoy() soloMatriculados public view returns (string memory _nombre, string memory _email) {
        DatosAlumno memory datos = datosAlumno[msg.sender];
        _nombre = datos.nombre;
        _email = datos.email;
    }
    
    function califica(address alumno, uint evaluacion, TipoNota tipo, uint calificacion) soloProfesor public {
        
        Nota memory nota = Nota(tipo, calificacion);
        
        calificaciones[alumno][evaluacion] = nota;
    }
    
    function miNota(uint evaluacion) soloMatriculados public view returns (TipoNota tipo, uint calificacion) {
        
        Nota memory nota = calificaciones[msg.sender][evaluacion];
        
        tipo = nota.tipo;
        calificacion = nota.calificacion;
    }
    
    modifier soloProfesor() {
        
        require(msg.sender == profesor, "Solo permitido al profesor");
        _;
    }
    
    
    modifier soloMatriculados() {
        
        string memory _nombre = datosAlumno[msg.sender].nombre;
        
        bytes memory b = bytes(_nombre);
        
        require(b.length != 0, "Solo permitido a alumnos matriculados");
        _;
        
    }
    
    
    modifier noMatriculados() {
        
        string memory _nombre = datosAlumno[msg.sender].nombre;
        
        bytes memory b = bytes(_nombre);
        
        require(b.length == 0, "Solo permitido a alumnos no matriculados");
        _;
        
    }
}
