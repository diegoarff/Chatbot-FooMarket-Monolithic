const { API_DB, ENDPOINTS_CARTS } = require('~inst');

async function deleteProducts(userId, userProducts) {

    //La función recibe como parámetros el id del usuario y un array validado con anterioridad de los productos que se desean eliminar

    try {
        let res = await API_DB.get(ENDPOINTS_CARTS.GET_CART+`?userId=${ userId }`);
        //Busca el carrito del usuario

        let cart = res.data;

        let arr = []

        //Crea un array de los id de los productos existentes en el carrito
        arr = cart[0].products.map(e => {return e.productId})

        //Remueve los ids repetidos de los productos nuevos ingresados por el usuario
        let filteredUP = userProducts.filter((e, idx) => {
            return userProducts.indexOf(e) == idx;
        })

        //Si en los productos ingresados por el usuario hay un id
        //que no se encuentra en el carrito, devuelve true
        let areNotInCart = filteredUP.some(e => !arr.includes(e));

        if(areNotInCart) {
            return false;
        } else {

            await API_DB.put(ENDPOINTS_CARTS.DELETE_CART_PRODUCTS+`?userId=${ userId }`, filteredUP);

            return true;
        }
    } catch (err) {
        console.log(err);
    }
}


module.exports = deleteProducts;