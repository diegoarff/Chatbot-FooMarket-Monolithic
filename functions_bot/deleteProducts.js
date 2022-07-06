const { API_DB, ENDPOINTS_CARTS } = require('../config/instance');

async function deleteProducts(userId, userProducts) {

    //La función recibe como parámetros el id del usuario y un array validado con anterioridad de los productos que se desean eliminar

    try {
        let res = await API_DB.get(ENDPOINTS_CARTS.GET_CART+`?userId=${ userId }`);
        //Busca el carrito del usuario

        let cart = res.data;

        let arr = []

        //Crea un array de los id de los productos existentes en el carrito
        arr = cart[0].products.map(e => {return e.productId})


        let filteredUP = userProducts.filter((e, idx) => {
            return userProducts.indexOf(e) == idx;
        })

        //En caso de que el mensaje del usuario tenga ids de productos repetidos, los quita y devuelve los originales
        //Ej: 
        //Usuario ingresa: [1, 1, 2, 3, 2, 9, 9]
        //
        //filteredUP = [1, 2, 3, 9]

        //Devuelve los ids diferentes entre los dos arrays
        filteredUP = filteredUP.filter(e => arr.includes(e));

        await API_DB.put(ENDPOINTS_CARTS.DELETE_CART_PRODUCTS+`?userId=${ userId }`, filteredUP);

        return console.log('Productos eliminados con éxito');

    } catch (err) {
        console.log(err);
    }
}


module.exports = deleteProducts;