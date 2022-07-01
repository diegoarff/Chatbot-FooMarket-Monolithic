let { API_DB, ENDPOINTS_CARTS, ENDPOINTS_PRODUCTS } = require('../config/instance');

async function viewCart(userId) {

    try {

        //Obtiene la información de todos los productos y del carrito del usuario
        let productRes = await API_DB.get(ENDPOINTS_PRODUCTS.GET_PRODUCTS);
        let cartRes = await API_DB.get(ENDPOINTS_CARTS.GET_CART+`?userId=${ userId }`);

        let products = productRes.data;
        let cart = cartRes.data;
        let msg = ``;
        let total = 0;


        let i = 0;
        let len = cart[0].products.length;
       
        let cartProduct;
        let dataProduct;

        for (; i < len; i++) {
        
            //Toma un producto del carrito según la iteración
            cartProduct = cart[0].products[i];

            //Toma la información del producto que está en el carrito de la base de datos,
            //recordando que el index de un producto en la base de datos es su id - 1
            dataProduct = products[cartProduct.productId - 1];

            msg += `> Id: ${cartProduct.productId}\n  Nombre: ${dataProduct.name}\n  Precio: $${dataProduct.price}\n  Cantidad: ${cartProduct.quantity}\n\n`
            total += (dataProduct.price * cartProduct.quantity);

        }

        await API_DB.put(ENDPOINTS_CARTS.PUT_TOTAL_AMOUNT+`?userId=${ userId }&total=${ total }`);

        return `${ msg }Cantidad total a pagar: $${ total }`;

    } catch (err) {
        console.log(err);
    }
}

module.exports = viewCart;