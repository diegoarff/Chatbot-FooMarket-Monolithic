var i18n = require("i18n");

const { API_DB, ENDPOINTS_PRODUCTS } = require('~inst');

async function getInfoProductId (id) {

  try {
    
    let res = await API_DB.get(ENDPOINTS_PRODUCTS.GET_PRODUCTS + `?productId=${ id }`);
    let item = res.data;

    let message = __('searchResults', item[0].id, item[0].name, item[0].price, item[0].category, item[0].description, item[0].image);

    return message;
    
  } catch (err) {
    console.log(err);
  }

}

module.exports = getInfoProductId;