const { API_DB, ENDPOINTS_PRODUCTS } = require('../config/instance');

async function getInfoProducts() {

    try {
        
        let res = await API_DB.get(ENDPOINTS_PRODUCTS.GET_PRODUCTS);
        let items = res.data;
    
        let space;
        let result = ``;
        let len = items.length;
        let i = 0;
    
        for (; i < len; i++) {
    
            //Genera un salto de línea cada 5 items
            if (i == 4 || i == 9 || i == 14) {
                space = '\n';
            } else {
                space = '';
            }
            //Toma los resultados del fetch y los va iterando
            result += `<b>${items[i].id})</b> ${items[i].name.substring(0, 16)} - $${items[i].price}\n${space}`;
        }
    
        return result;

    } catch (err) {
        console.log(err);
    }

}

module.exports = getInfoProducts;