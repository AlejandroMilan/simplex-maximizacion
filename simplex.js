class SimplexMaximizacion {
    constructor({ funcionObjetivo, restricciones }) {
        this.funcionObjetivo = funcionObjetivo
        this.restricciones = restricciones
        this.matriz = []
        this.cabecerasMatriz = [[],[]]
        this.indexVariableEntrada = NaN
        this.indexVariableSalida = NaN
        this.valorSolucion = NaN
        this.iteracion = 0
    }

    definirMatriz() {
        // Creamos la matriz sin variables de holgura/excedencia
        this.restricciones.forEach(restriccion => {
            this.matriz.push(restriccion)
        })
        // Revertimos la función objetivo a la matriz (representará la fila de costos mínimos)
        const funcionObjetivoRevertida = this.revertirValoresFuncionObjetivo()
        // Agregamos un cero para emparejar la columna Z y la agregamos a la matriz
        this.matriz.push([...funcionObjetivoRevertida, 0])

        // Añadimos las variables de holgura/excedencia a nuestra matriz
        this.definirVariablesS()

        // Definimos las cabeceras, para más tarde identificar elementos pivote
        this.definirCabeceras()
    }

    revertirValoresFuncionObjetivo() {
        const resultado = []
        this.funcionObjetivo.forEach(cociente => {
            resultado.push(cociente * -1)
        })

        return resultado
    }

    definirVariablesS() {
        this.matriz.forEach((fila, index) => {
            /* Definimos cuántos ceros se van a agregar */
            const cerosParaAgregar = this.restricciones.length
            let arregloCeros = []
            for (let i = 0; i < cerosParaAgregar; i++) {
                arregloCeros = [...arregloCeros, i === index ? 1 : 0]
            }

            fila.push(...arregloCeros)

            // Regresamos el que antes era el último elemento, a su lugar otra vez
            fila = this.moverElementoDeArreglo({
                arreglo: fila,
                indexActual: fila.length - cerosParaAgregar - 1,
                nuevoIndex: fila.length - 1
            })
            this.matriz[index] = fila
        })
    }

    definirCabeceras() {
        const cantidadX = this.matriz[0].length - this.restricciones.length - 1
        const cantidadS = this.matriz[0].length - cantidadX - 1

        for (let i = 1; i <= cantidadX; i++)
            this.cabecerasMatriz[0].push(`x${i}`)
        this.cabecerasMatriz[0].push('R')

        for (let i = 1; i <= cantidadS; i++)
            this.cabecerasMatriz[1].push(`s${i}`)
        this.cabecerasMatriz[1].push('z')
    }

    moverElementoDeArreglo({ arreglo, indexActual, nuevoIndex }) {
        if (nuevoIndex >= arreglo.length) {
            var k = nuevoIndex - arreglo.length + 1;
            while (k--) {
                arreglo.push(undefined);
            }
        }
        arreglo.splice(nuevoIndex, 0, arreglo.splice(indexActual, 1)[0]);
        return arreglo;
    }

    /*
     * -----------------------------------------------
     Aquí comienzan los pasos de cada iteración
    */

    obtenerVariableEntrada() {
        this.iteracion++
        const vectorCostesMinimos = this.matriz[this.matriz.length -1]
        const masNegativoZ = this.obtenerMasNegativoZ()
        const indexElementoMasNegativo = vectorCostesMinimos.indexOf(masNegativoZ)
        
        this.indexVariableEntrada = indexElementoMasNegativo
    }

    obtenerMasNegativoZ() {
        return [...this.matriz[this.matriz.length - 1]].sort((a, b) => a > b ? 1 : -1)[0]
    }

    obtenerVariableSalida() {
        // Creamos la columna donde se encuentran las variables de entrada y salida junto la columna R
        let columnaVariableSalida = []
        let columnaR = []
        this.matriz.forEach(fila => {
            columnaVariableSalida.push(fila[this.indexVariableEntrada])
            columnaR.push(fila[fila.length - 1])
        })

        // Validamos la condicion de factibilidad
        this.validarFactibilidad(columnaVariableSalida)


        // Eliminamos los elementos que se encuentran en la fila z porque no se ocupan aquí
        columnaVariableSalida = columnaVariableSalida.filter((e, index) => index !== columnaVariableSalida.length -1)
        columnaR = columnaR.filter((e, index) => index !== columnaR.length -1)

        // Guardamos en un arreglo las divisiones de elemento en R/ elemento de la columna pivote
        let divisiones = []
        columnaR.forEach((elementoColumnaR, index) => {
            divisiones.push(elementoColumnaR / columnaVariableSalida[index])
        })
        // Arrojamos un error si es que ninguno es positivo
        if (divisiones.filter(e => e >= 0).length === 0) {
            throw new Error('Ningun resultado de la division es positivo :c')
        }

        // Obtenemos el resultado de división positivo que sea menor
        const divisionesTemp = divisiones.filter(e => e >= 0)
        const resultadoMenor = [...divisionesTemp].sort((a, b) => a > b ? 1 : -1)[0]

        // Definimos el index de la variable de salida como el index de los resultados de divisiones

        const indexResultadoMenor = divisiones.indexOf(resultadoMenor)
        this.indexVariableSalida = indexResultadoMenor
    }

    validarFactibilidad(columnaR) {
        let elementosMayoresQueCero = 0
        columnaR.forEach(elementoColumna => {
            if (elementoColumna > 0) elementosMayoresQueCero++
        })

        if (elementosMayoresQueCero === 0) {
            // Al no funcionar la iteración actual, se descuenta
            this.iteracion --
            console.log(this.obtenerResultado())
            throw new Error('El problema tiene solución limitada (no acotada)')
        }
    }

    actualizarCabeceras() {
        this.cabecerasMatriz[1][this.indexVariableSalida] = this.cabecerasMatriz[0][this.indexVariableEntrada]
    }

    actualizarFilaPivote() {
        const nuevaFila = []
        const filaPivote = this.matriz[this.indexVariableSalida]
        const elementoPivote = filaPivote[this.indexVariableEntrada]
        const formula = (valorActual) => valorActual / elementoPivote
        filaPivote.forEach(elementoFila => {
            nuevaFila.push(formula(elementoFila))
        })

        this.matriz[this.indexVariableSalida] = nuevaFila
    }

    actualizarMatriz() {
        const filaPivote = this.matriz[this.indexVariableSalida]

        this.matriz.forEach((fila, index) => {
            const nuevaFila = []
            if (index !== this.indexVariableSalida) {
                const elementoPivote = fila[this.indexVariableEntrada]
                const formula = (valorActualElemento, nuevoValorFilaPivote) =>
                    valorActualElemento - (elementoPivote * nuevoValorFilaPivote)
                fila.forEach((elementoFila, index) => {
                    nuevaFila.push(formula(elementoFila, filaPivote[index]))
                })
                this.matriz[index] = nuevaFila
            }
        })

        const filaZ = this.matriz[this.matriz.length -1]
        this.valorSolucion = filaZ[filaZ.length -1]
    }

    esResuelto() {
        const filaZ = this.matriz[this.matriz.length -1]
        let elementosNegativosEnZ = 0
        filaZ.forEach(elementoFilaZ => {
            if (elementoFilaZ < 0) elementosNegativosEnZ++
        })
        return elementosNegativosEnZ === 0
    }

    obtenerResultado() {
        const resultado = {}
        this.cabecerasMatriz[1].forEach((cabezera, index) => {
            resultado[cabezera] = this.matriz[index][this.matriz[0].length - 1]
        })
        resultado.solucionOptima = this.valorSolucion
        resultado.iteracionesOcupadas = this.iteracion

        return resultado
    }

    resolver() {
        this.definirMatriz()
        while (!this.esResuelto()) {
            this.obtenerVariableEntrada()
            this.obtenerVariableSalida()
            this.actualizarCabeceras()
            this.actualizarFilaPivote()
            this.actualizarMatriz()
        }
    }
}

module.exports = SimplexMaximizacion
