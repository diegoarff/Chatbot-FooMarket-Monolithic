const { API_DB, ENDPOINTS_CARTS } = require('../config/instance');

async function addToCart(userId, userProducts) {

    //La función recibe como parámetros el id del usuario y un array validado con anterioridad de los productos que se desean agregar

    try {
        //Busca el carrito del usuario
        let res = await API_DB.get(ENDPOINTS_CARTS.GET_CART+`?userId=${ userId }`);
        let cart = res.data;

        let filteredUP = userProducts.filter((e, idx) => {
            return userProducts.indexOf(e) == idx;
        })
        //En caso de que el mensaje del usuario tenga ids de productos repetidos, los quita y devuelve los originales
        //Ej: 
        //Usuario ingresa: [1, 1, 2, 3, 2, 9, 9]
        //
        //filteredUP = [1, 2, 3, 9]

        let len = filteredUP.length;
        //Toma la longitud del array filtrado

        
        for(let i = 0; i < len; i++){
            cart[0].products.push({
                productId: filteredUP[i],
                quantity: 0
            });
        }
        //Crea un objeto en la propiedad products del carrito por cada elemento del array filtrado
        //Tomará los id en filteredUP y se los asignará a cada objeto nuevo
        //Cada producto inicia con cantidad 0
        
        let userProductsLen = userProducts.length;
        //Toma la longitud del array original de productos por agregar del usuario

        for(let i = 0; i < len; i++) {
            for(let j = 0; j < userProductsLen; j++) {
                if(cart[0].products[i].productId == userProducts[j]) {

                    cart[0].products[i].quantity++;
                } 
            }
        }
        //Va a iterar sobre cada producto de los creados en la línea 69
        //Luego va a iterar sobre cada id de los que el usuario quiere agregar
        //Si encuentra una coincidencia entre los id, le sumará a la cantidad

        await API_DB.put(ENDPOINTS_CARTS.PUT_PRODUCTS_CART+`?userId=${ userId }`, cart[0].products);
        //Actualiza la base de datos con los nuevos productos

        return console.log(`Productos agregados con éxito`);

    } catch (err) {
        console.log(err);
    }
}


module.exports = addToCart;