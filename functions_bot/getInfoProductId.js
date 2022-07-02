const { API_DB, ENDPOINTS_PRODUCTS } = require('../config/instance');

async function getInfoProductId (id) {

  try {
    
    let res = await API_DB.get(ENDPOINTS_PRODUCTS.GET_PRODUCTS + `?productId=${ id }`);
    let item = res.data;

    let message = `<b>🔍 Mostrando resultados de la búsqueda:</b>\n\n` +
        `<b>🆔 Código</b>: ${item[0].id}\n\n` +
        `<b>📝 Nombre</b>: ${item[0].name}\n\n` +
        `<b>💰 Precio</b>: ${item[0].price}\n\n` +
        `<b>🛍 Categoría</b>: ${item[0].category}\n\n` +
        `<b>🖊 Descripción</b>: ${item[0].description}\n\n` +
        `${item[0].image}`;

    return message;
    
  } catch (err) {
    console.log(err);
  }

}

module.exports = getInfoProductId;