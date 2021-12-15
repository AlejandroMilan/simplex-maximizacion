const SimplexMaximizacion = require('./simplex')

const problema = new SimplexMaximizacion({
    funcionObjetivo: [2, 1, -3, 5],
    restricciones: [
        [1, 2, -2, 4, 40],
        [2, -1, 1, 2, 8],
        [4, -2, 1, -1, 10]
    ]
})
problema.resolver()
console.log(problema.obtenerResultado())
console.log('Las variables no mostradas en el resultado tienen un valor de 0')

const problema2 = new SimplexMaximizacion({
    funcionObjetivo: [8, 6, 3, -2],
    restricciones: [
        [1, 2, -2, 4, 40],
        [2, -1, 1, 2, 8],
        [4, -2, 1, -1, 10]
    ]
})

try {
    problema2.resolver()
} catch (error) {
    console.log(error.message)
}


