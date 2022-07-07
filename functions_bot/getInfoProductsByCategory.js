const { API_DB, ENDPOINTS_PRODUCTS } = require('../config/instance');

async function getInfoProductsByCategory(category) {

    try {
        
        let res = await API_DB.get(ENDPOINTS_PRODUCTS.GET_PRODUCTS_CATEGORY + `?category=${ category }` );
        let items = res.data;
    
        let space;
        let result = ``;
        let len = items.length;
        let i = 0;
            //Toma los resultados del fetch y los va iterando
            result += `<b>${items[i].id})</b> ${items[i].name.substring(0, 16)} - $${items[i].price}\n${space}`;
    
        return result;

    } catch (err) {
        console.log(err);
    }

}

module.exports = getInfoProductsByCategory;