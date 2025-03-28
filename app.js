//======= Seleccionando mis elemento======//
const formulario = document.querySelector(".funcional");
const descripcion = document.querySelector("#nombre");
const monto = document.querySelector("#cantidad");
const boton = document.querySelector(".submit");
const miPresupuesto = document.querySelector(".miPresupuesto");
const miRestante = document.querySelector(".miRestante");
const contenedorAlerta = document.querySelector(".alerta");
//contenedor de los gastos
const contenedor = document.querySelector(".elementos");
// =============Modal=========== //
const modal = document.querySelector(".modal");
const openModal = document.querySelector(".abrirModal");
const tomarValor = document.querySelector(".cerrarModal");
const inputModal = document.querySelector(".modalInput");
const ventanaModal = document.querySelector(".content")
const spinner = document.querySelector(".wrappSpinner");
const btnReset = document.querySelector(".abrirModal");
//=========Añadiendo eventos==========//
agregarEventos();
function agregarEventos() {
    tomarValor.addEventListener("click", tomarPresupuesto);
    formulario.addEventListener("submit", generarGasto);
    btnReset.addEventListener("click", () => {
        localStorage.clear()
        location.reload()
    })
    document.addEventListener("DOMContentLoaded", () => {
        if (localStorage.getItem("valor")) {
            displayNone()
            presupuestoGuardado()
        }
    })
    document.addEventListener("beforeunload", () => {
        if (localStorage.getItem("valor")) {
            displayNone()
            presupuestoGuardado()
        }
    })
}


let miGrafica; //==============================<<<<<<<<

//==========Clases===========//
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = presupuesto;
        this.restante = presupuesto;
        this.gastos = [];
    }
    nuevoGasto(gasto) {
        // copiamos el arreglo de gastos y le pasamos
        this.gastos =  [...this.gastos, gasto];
        localStorage.setItem("gastos", JSON.stringify(this.gastos));
        this.calcularResto();
    }
    //Borrar Gasto desde su boton
    borrarGasto(id) {
        this.gastos = this.gastos.filter( gasto => gasto.id !== id);
        localStorage.setItem("gastos", JSON.stringify(this.gastos))
        this.calcularResto();
    }
    //metodo para calcular cuando dispone aun
    calcularResto() {
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.valor, 0);
        this.restante = this.presupuesto - gastado;
    }

}

class CrearGasto {
    //insertar presupuesto
    insertarGasto(monto) {
        const { presupuesto, restante } = monto;
        //añadiendo los datos de monto a el HTML
        miPresupuesto.textContent = `${presupuesto} $`;
        miRestante.textContent = `${restante} $`;
    }
    // mandar alerta
    imprimirAlerta(msj) {
        //crear aviso
        const msjAlerta = document.createElement("span");
        msjAlerta.textContent = msj;
        contenedorAlerta.appendChild(msjAlerta);
        setTimeout(() => {
            msjAlerta.remove();
        }, 2000);
    }

    agregarGastoListado(gastos) {
        this.limpiarHTML();// eliminar el html previo
        //iterar sobre los gastos
        gastos.forEach( gasto => {//==============>
            const { valor, nombre, id, color } = gasto;
            //Crear items en HTML
            const nuevoItem = document.createElement("article");
            nuevoItem.classList.add("gasto");
            nuevoItem.dataset.id = id;
            nuevoItem.style.backgroundColor = color;//=============>
                // p con el texto
            const info = document.createElement("p")
            info.textContent = `${nombre} - ${valor} $ `
            // btn eleminar 
            const btnBorrar = document.createElement("button");
            btnBorrar.classList.add("eliminar");
            btnBorrar.textContent = "x"
            // agregando la funcion al boton de eliminar
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }
            //agrego info y valor al item
            nuevoItem.appendChild(info);
            nuevoItem.appendChild(btnBorrar);
            contenedor.appendChild(nuevoItem);
        });
    }
    //imprimir en la grafica
    graficaItems(gastos = [], restante) {
        let nombres = gastos.map(gasto => gasto.nombre);
        let valores = gastos.map(gasto => gasto.valor);
        let colores = gastos.map(gasto => gasto.color);
        valores.push(restante)
        if (miGrafica) {
            miGrafica.destroy();
        }

        const ctx = document.getElementById('myChart');
        miGrafica = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: nombres,
                datasets: [{
                    label: 'Mi restante',
                    data: valores,
                    borderWidth: 0,
                    borderColor: "black",
                    backgroundColor: [...colores, "#c9c9c9"]
                }]
            },
            options: {
                scales: {
                    y: {
                        max: restante,
                        display: false
                    },
                },
                layout: {
                    padding: {
                        top: 10,
                        right: 20,
                        bottom: 30,
                        left: 40
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                        position: 'bottom',
                        labels: {
                            boxWidth: 20,
                            padding: 10,

                            font: {
                                family: 'Cascadia Code',
                                size: 14,
                                weight: 700
                            }
                        }
                    }
                }
            }

        });

    }
    // limpiar HTML
    limpiarHTML() {
        while(contenedor.firstChild) {
            contenedor.removeChild(contenedor.firstChild)
        }
    }
    // Funcion de actualizar el restante
    actualizarRestante(resto) {
        miRestante.textContent = `${resto} $`;
    }
    //Funcion de calcular restante
    cuantoQueda(resta) {
        const { presupuesto, restante } = resta;
        //comprobar el 25%
        if ( ( presupuesto / 4 ) > restante ) {
            miRestante.style.color = "red";
            miRestante.style.textShadow = "0 0 10px red";
        } else if((presupuesto / 2) > restante) {
            miRestante.style.color = "orange";
            miRestante.style.textShadow = "0 0 10px orange";
        } else {
            miRestante.style.color = "black";
            miRestante.style.textShadow = "none";
            boton.style.opacity = 1;
            boton.disabled = false;
        }
        // si el presupuesto se agota
        if(restante <= 0) {
            this.imprimirAlerta("Presupuesto agotado");
            boton.style.opacity = 0.5;
            boton.disabled = true;
        }
    }
    // agregar a la grafica
}
// Instanciando variables
let interface = new CrearGasto();
let presupuesto;//===================================<<<<<<<<


//============ Funciones ===========//
// si hay datos guardados
function presupuestoGuardado() {
    let monto = JSON.parse(localStorage.getItem("valor"));
    presupuesto = new Presupuesto(monto);
    if (localStorage.getItem("gastos")) {
        let guardados = JSON.parse(localStorage.getItem("gastos"));
        interface.agregarGastoListado(guardados);
        guardados.forEach(ele => {
            presupuesto.nuevoGasto(ele);
        })
        interface.graficaItems(guardados, presupuesto.restante);
        interface.actualizarRestante(monto.restante);
        interface.insertarGasto(presupuesto);
        interface.cuantoQueda(presupuesto);
    }
}
// quitar el modar y mostrar spinner
function displayNone() {
    modal.style.display = "none"
    spinner.style.display = "flex"
    setTimeout(() => {
        spinner.style.display = "none"
    }, 500);
}

function tomarPresupuesto(event) {
    event.preventDefault()
    let valor = parseFloat(inputModal.value);
    
    if ( valor === "" || valor === null || isNaN( Number(valor) ) || valor < 10 ) {
        //creamos una alerta
        let alerta = () => {
            let aviso = document.createElement("p")
            aviso.classList.add("alertModal");
            aviso.textContent = "Presupuesto Inválido"
            ventanaModal.appendChild(aviso);
            // se elimina la alerta despues 1.5s
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }    
        alerta()
        return
    }
    displayNone()
    presupuesto = new Presupuesto(valor);
    localStorage.setItem("valor", JSON.stringify(valor));
    interface.insertarGasto(presupuesto);
    interface.graficaItems( [] ,presupuesto.restante);
}
//========Agregar Gasto al DOM ========//
function generarGasto(event) {
    event.preventDefault();
    //tomando valores de los inputs
    const nombre = descripcion.value;
    const valor = Number(monto.value);
    let color = imprimirColor();
    //Validando Inputs
    if(nombre === "" || valor ==="") {
        interface.imprimirAlerta("Ambos campos son obrigatorios");
        return;
    } else if (valor <= 0 || isNaN(valor) ) {
        interface.imprimirAlerta("Cantidad no valida.")
        return;
    }
    //Generar objeto con los datos
    const gastado = { nombre, valor, id: Date.now(), color };
    //Añadiendo el gasto
    presupuesto.nuevoGasto(gastado);
    //agregar gasto a la listo
    const { gastos, restante } = presupuesto;
    interface.agregarGastoListado(gastos);
    // actulizar el resto
    interface.actualizarRestante(restante);
    // comprobar cuanto queda de presupuesto
    interface.cuantoQueda(presupuesto);
    //mandar a la grafica
    interface.graficaItems(gastos, restante);
    //refrescar el formulario
    formulario.reset();
}
//========Eliminar Gasto =============//
function eliminarGasto(id) {
    presupuesto.borrarGasto(id);
    const { gastos, restante } = presupuesto;
    interface.agregarGastoListado(gastos)
    interface.actualizarRestante(restante);
    interface.cuantoQueda(presupuesto);
    interface.graficaItems(gastos, presupuesto.restante);
}

function imprimirColor() { //======================>
    const letters = "0123456789ABCDEF";
    let color = "rgba(";

    for (let i = 0; i < 3; i++) {
        color += parseInt(Math.random() * 256) + ",";
    }

    color += "0.5)";
    return color;
}
