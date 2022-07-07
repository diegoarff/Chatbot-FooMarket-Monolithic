require('dotenv').config();

const TeleBot = require('telebot');
var i18n = require("i18n");

//Instancia de axios
const { API_DB, ENDPOINTS_CARTS } = require('~inst');

const { btn, log } = require('~utils');
const getInfoProducts = require('~f/getInfoProducts.js');
const getInfoProductId = require('~f/getInfoProductId');
const areValidNumbers = require('~f/areValidNumbers');
const createCart = require('~f/createCart');
const viewCart = require('~f/viewCart');
const validateDetails = require('~f/validateDetails');
const getInfoProductsByCategory = require('~f/getInfoProductsByCategory');
const sendMail = require('~f/sendMail');
const deleteProducts = require('~f/deleteProducts');
const total = require('~f/total');
const addProducts = require('~f/addProducts');

var directory = 'data_en';

i18n.configure({
    locales:['en_US', 'es_ES'],
    directory: __dirname + '/locales',
    defaultLocale: 'en_US',
    register: global
});

let TOKEN = process.env.TOKEN_TELEGRAM;

const bot = new TeleBot({
    token: TOKEN,
    usePlugins: ['commandButton', 'askUser']
});

var result = {};

function actualizarDirectorio(result_f) {
    result = result_f;
}

//MOSTRAR MENU PRINCIPAL

bot.on('/start', msg => {

    getLanguage(msg);

    //Definir los botones de opciones
    let replyMarkup = bot.inlineKeyboard([
        [btn(__('showProductsBtn'), { callback: '/showProducts' }), btn(__('viewCartBtn'), { callback: '/viewCart'}) ],
        [btn(__('paymentMethodsBtn'), { callback: '/listPayment' }), btn(__('deliveryBtn'), { callback: '/delivery' })]
    ]);

    let username = msg.chat.first_name;

    let id = msg.from.id;
    ms_id = msg.message_id;
    //Muestra el mensaje al usuario con los botones de opciones
    return bot.sendMessage(id, __('start', username), { once: true, parseMode: 'html', replyMarkup });

});

bot.on('/menu', msg => {

    getLanguage(msg);

    let id = msg.from.id;

    //Definir los botones de opciones
    let replyMarkup = bot.inlineKeyboard([
        [btn(__('showProductsBtn'), { callback: '/showProducts' }), btn(__('viewCartBtn'), { callback: '/viewCart'}) ],
        [btn(__('paymentMethodsBtn'), { callback: '/listPayment' }), btn(__('deliveryBtn'), { callback: '/delivery' })]
    ]);

    //Muestra el mensaje al usuario con los botones de opciones
    return bot.sendMessage(id, __('menu'), { parseMode: 'html', replyMarkup, once: true  });

});

//MUESTRA LA LISTA DE PRODUCTOS DE LA DATABASE
bot.on('/showProducts', msg => {

    getLanguage(msg);

    let id = msg.from.id;

    //Define los botones a mostrar al final de la lista
    let replyMarkup = bot.inlineKeyboard([
        [btn(__('nextPageBtn'), { callback: '/updatepage' })],
        [btn(__('searchBtn'), { callback: '/searchProduct' }), btn(__('filterProductBtn'), { callback: '/filterProduct' })],
        [btn(__('addProductsBtn'), { callback: '/cart' })],
        [btn(__('menuBtn'), { callback: '/menu' })]
    ]);

    // Funcion asincrona que busca los productos
    async function products() {

        try {
            
            // Se crea la variable que almacena la lista de productos de la Database 
            result = await getInfoProducts();

            async function list() {

                try {
                    await bot.sendMessage(id, __('getInfoProducts', result.part1), { parseMode: 'html', replyMarkup, once: true  }).message_id;
                    return result;
                }
                catch (error){
                    log(error)
                }
            } list();

        } 
        
        catch (error) {
            log(error);
        }
        actualizarDirectorio(result);

    } products();
});


bot.on('/updatepage', msg => {

    getLanguage(msg);

    let id = msg.from.id;
    
    //Define los botones a mostrar al final de la lista
    let replyMarkup = bot.inlineKeyboard([
        [btn(__('searchBtn'), { callback: '/searchProduct' }), btn(__('filterProductBtn'), { callback: '/filterProduct' })],
        [btn(__('addProductsBtn'), { callback: '/cart' })],
        [btn(__('menuBtn'), { callback: '/menu' })]
    ]);


    bot.sendMessage(id, __('updatepage', result.part2), { parseMode: 'html', replyMarkup, once: true  });

});

//filtrar los productos por categorías

bot.on ('/filterProduct',function (msg){

    getLanguage(msg);
    
    //Define los botones a mostrar al final de la lista
    let replyMarkup = bot.inlineKeyboard([
        [btn(__('electronicsBtn'), { callback: '/electronicsProduct' }), btn(__('jewelryBtn'), { callback: '/jeweleryProduct' })],
        [btn(__('womenBtn'), { callback: '/womenProducts' }), btn(__('menBtn'), { callback: '/menProduct' })],
        [btn(__('menuBtn'), { callback: '/menu' })]
    ]);

    let id = msg.from.id;

    //Muestra el mensaje al usuario junto a los botones definidos
    return bot.sendMessage(id, __('filterProducts'), { parseMode: 'html', replyMarkup });

});

//PRODUCTOS CATEGORÍA ELECTRÓNICA

bot.on('/electronicsProduct', function (msg) {

    getLanguage(msg);

    let replyMarkup = bot.inlineKeyboard([
        [btn(__('searchBtn'), { callback: '/searchProduct' })],
        [btn(__('addProductsBtn'), { callback: '/cart' })],
        [btn(__('menuBtn'), { callback: '/menu' })]
    ]);

    let id = msg.from.id;


    async function electronicsProducts() {

        try {
            let category = 'electronics'
            let message = await getInfoProductsByCategory(category);

            return bot.sendMessage(id, __('electronics', message), { parseMode: 'html', replyMarkup });

        } catch (error) {
            log(error);
        }

    } electronicsProducts();

});

//PRODUCTOS CATEGORÍA JOYERÍA

bot.on('/jeweleryProduct', function (msg) {

    getLanguage(msg);

    let replyMarkup = bot.inlineKeyboard([
        [btn(__('searchBtn'), { callback: '/searchProduct' })],
        [btn(__('addProductsBtn'), { callback: '/cart' })],
        [btn(__('menuBtn'), { callback: '/menu' })]
    ]);

    let id = msg.from.id;


    async function jeweleryProducts() {

        try {
            let category = 'jewelery'
            let message = await getInfoProductsByCategory(category);

            return bot.sendMessage(id, __('jewelry', message), { parseMode: 'html', replyMarkup });

        } catch (error) {
            log(error);
        }

    } jeweleryProducts();

});

//PRODUCTOS CATEGORÍA ropa para damas

bot.on('/womenProducts', function (msg) {

    getLanguage(msg);

    let replyMarkup = bot.inlineKeyboard([
        [btn(__('searchBtn'), { callback: '/searchProduct' })],
        [btn(__('addProductsBtn'), { callback: '/cart' })],
        [btn(__('menuBtn'), { callback: '/menu' })]
    ]);

    let id = msg.from.id;


    async function womanProducts() {

        try {
            let category = "women's clothing"
            let message = await getInfoProductsByCategory(category);

            return bot.sendMessage(id, __('women', message), { parseMode: 'html', replyMarkup });

        } catch (error) {
            log(error);
        }

    } womanProducts();

});

//PRODUCTOS CATEGORÍA ropa para caballeros

bot.on('/menProduct', function (msg) {

    getLanguage(msg);

    let replyMarkup = bot.inlineKeyboard([
        [btn(__('searchBtn'), { callback: '/searchProduct' })],
        [btn(__('addProductsBtn'), { callback: '/cart' })],
        [btn(__('menuBtn'), { callback: '/menu' })]
    ]);

    let id = msg.from.id;


    async function menProducts() {

        try {
            let category = "men's clothing"
            let message = await getInfoProductsByCategory(category);

            return bot.sendMessage(id, __('men', message), { parseMode: 'html', replyMarkup });

        } catch (error) {
            log(error);
        }

    } menProducts();

});

//BUSCAR INFORMACIÓN DE UN PRODUCTO

//El usuario ingresará un id que será pasado al ask.id de abajo
bot.on('/searchProduct', msg => {

    getLanguage(msg);

    let id = msg.from.id;
    return bot.sendMessage(id, __('searchProduct'), { parseMode: 'html', once: true, ask: 'id' });
});

//Toma lo que responda el usuario después del /searchProduct
bot.on('ask.id', msg => {

    getLanguage(msg);

    let id = msg.from.id;

    let replyMarkup = bot.inlineKeyboard([
        [ btn(__('searchAnotherBtn'), { callback: '/searchProduct' }), btn(__('menuBtn'), { callback: '/menu' }) ]
    ]);

    //Se hace una validacion primero
    let ID = areValidNumbers(msg.text);

    if(!ID) {
        return bot.sendMessage(id, __('askidInvalid'), { once: true, ask: 'id' });
    }

    //Se invoca a la funcion asaincrona
    async function searchProduct() {

        try {
            let message = await getInfoProductId(ID);
            return bot.sendMessage(id, `${message}`, { once: true , parseMode: 'html', replyMarkup, });

        } 
        
        catch (error) {
            log(error);
        }

    } searchProduct();

});

//CREACIÓN DEL CARRITO Y AGREGADO DE PRODUCTOS

bot.on('/cart', msg => {

    getLanguage(msg);
    
    let id = msg.from.id;

    //Se crea el carrito con el id del usuario
    createCart(id); 

    return bot.sendMessage(id, __('cart'), {ask: 'cartprod', once: true, parseMode: 'html'});
});

bot.on('ask.cartprod', function (msg) {

    getLanguage(msg);

    let replyMarkup = bot.inlineKeyboard([
        [ btn(__('addMoreBtn'), { callback: '/addMore'}) ],
        [ btn(__('viewCartBtn'), { callback : '/viewCart'}), btn(__('menuBtn'), { callback: '/menu' })  ]
    ]);

    let id = msg.from.id;
    let text = msg.text; 

    async function addProductsCart(){
        try {

            let validProducts = areValidNumbers(text);

            if(!validProducts) {
                return bot.sendMessage(id, __('cartprodInvalid'), {ask: 'cartprod'});
            }  
            
            else {
                //Agrega los productos al carrito
                await addProducts(id, validProducts);
                return bot.sendMessage(id, __('cartprod', text), { replyMarkup, once: true , parseMode: 'html'});

            }  

        } 
        
        catch (err) {
            log(err)
        }

    }addProductsCart();

});

//VER CARRITO

bot.on('/viewCart', msg => {

    getLanguage(msg);

    let replyMarkup = bot.inlineKeyboard([
        [ btn(__('addMoreBtn'), { callback: '/addMore'}), btn(__('deleteBtn'), { callback: '/deleteProducts'}) ],
        [ btn(__('checkoutBtn'), { callback: '/facturar'}), btn(__('menuBtn'), { callback: '/menu' }) ]
    ]);

    let id = msg.from.id;

    async function verCarrito() {

        try {

            let res = await viewCart(id);

            if(res == undefined) {

                replyMarkup = bot.inlineKeyboard([
                    [ btn(__('showProductsBtn'), { callback: '/showProducts' }), btn(__('menuBtn'), { callback: '/menu' }) ]
                ]);
                return bot.sendMessage(id, __('viewCartInvalid'), { replyMarkup });
            }
            return bot.sendMessage(id, __('viewCart', res), { replyMarkup, once: true, parseMode: 'html' });

        } 
        
        catch (err) {
            log(err);
        }

    }verCarrito();
   
})

//AGREGAR MÁS PRODUCTOS AL CARRITO UNA VEZ ESTÁ CREADO

bot.on('/addMore', msg => {

    getLanguage(msg);
    
    let id = msg.from.id;
    return bot.sendMessage(id, __('addMore'), {ask: 'cartprod', once: true, parseMode: 'html'});
});

//VER METODOS DE PAGO

bot.on('/listPayment', msg => {
    
    getLanguage(msg);
    
    let replyMarkup = bot.inlineKeyboard([
        [btn(__('dollarsBtn'), { callback : '/cash'}), btn(__('transfersBtn'), { callback: '/transfers' })],
        [btn(__('cryptosBtn'), { callback : '/cryptos'}), btn(__('cardBtn'), { callback : '/card'})],
        [btn(__('foreignBtn'), { callback : '/foreign_cash'}), btn(__('menuBtn'), { callback : '/menu'})]
    ]);

    let id = msg.from.id;
    return bot.sendMessage(id, __('listPayment'), { replyMarkup, once: true , parseMode: 'html' });
});

// INFO PARA MONEDAS EXTRANJERAS

bot.on('/foreign_cash', msg => {

    getLanguage(msg);
    
    let replyMarkup = bot.inlineKeyboard([
        [btn(__('backPaymentBtn'), { callback : '/listPayment'})],
        [btn(__('menuBtn'), { callback : '/menu'})]
    ]);

    let message = __('foreignCash');

    let id = msg.from.id;
    return bot.sendMessage(id, `${ message }`, { replyMarkup, once: true , parseMode: 'html' });
});

// INFO PARA TARJETAS

bot.on('/card', msg => {

    getLanguage(msg);
       
    let replyMarkup = bot.inlineKeyboard([
        [btn(__('backPaymentBtn'), { callback : '/listPayment'})],
        [btn(__('menuBtn'), { callback : '/menu'})]
    ]);

    let id = msg.from.id;
    return bot.sendMessage(id, __('card'), { replyMarkup, once: true , parseMode: 'html' });
});

// INFO PARA EFECTIVO

bot.on('/cash', msg => {

    getLanguage(msg);
       
    let replyMarkup = bot.inlineKeyboard([
        [btn(__('backPaymentBtn'), { callback : '/listPayment'})],
        [btn(__('menuBtn'), { callback : '/menu'})]
    ]);

    let id = msg.from.id;
    return bot.sendMessage(id, __('cash'), { replyMarkup, once: true , parseMode: 'html' });
});

// INFO PARA TRANSFERENCIAS

bot.on('/transfers', msg => {

    getLanguage(msg);
       
    let replyMarkup = bot.inlineKeyboard([
        [btn(__('backPaymentBtn'), { callback : '/listPayment'})],
        [btn(__('menuBtn'), { callback : '/menu'})]
    ]);

    let message = __('transfers');

    let id = msg.from.id;
    return bot.sendMessage(id, `${ message }`, { replyMarkup, once: true , parseMode: 'html' });
});

// INFO PARA CRYPTOS

bot.on('/cryptos', msg => {

    getLanguage(msg);
       
    let replyMarkup = bot.inlineKeyboard([
        [btn(__('backPaymentBtn'), { callback : '/listPayment'})],
        [btn(__('menuBtn'), { callback : '/menu'})]
    ]);

    let message = __('cryptos')

    let id = msg.from.id;
    return bot.sendMessage(id, `${ message }`, { replyMarkup, once: true , parseMode: 'html' });
});


//VER ZONAS DE DELIVERY

bot.on('/delivery', msg => {

    getLanguage(msg);

    let id = msg.from.id;
    let replyMarkup = bot.inlineKeyboard([
        [btn(__('menuBtn'), { callback : '/menu'})]
    ]);

    return bot.sendMessage(id, __('delivery'), { replyMarkup, once: true , parseMode: 'html' });
});

bot.on('callbackQuery', msg => {
    log('callbackQuery data:', msg.data);
    bot.answerCallbackQuery(msg.id);
});

//FACTURACIÓN

bot.on('/facturar', function (msg) {

    getLanguage(msg);

    let id = msg.from.id;
    let message = __('factura');

    return bot.sendMessage(id, `${ message }`, { parseMode: 'html', once: true, ask: 'userDetails' });

});

bot.on('ask.userDetails', function (msg) {

    getLanguage(msg);

    let id = msg.from.id;
    let text = msg.text;

    async function userDetails() {

        let details = await validateDetails(text);

        if(!details) {
            return bot.sendMessage(id, __('userDetailsInvalid'), { parseMode: 'html', once: true, ask: 'userDetails' });
        } 
        
        else {

            try {

                // Se actualizan los datos del usuario
                bot.sendMessage(id, __('try_userDetails'), { parseMode: 'html' });
                await API_DB.put(ENDPOINTS_CARTS.PUT_USER_DETAILS+`?userId=${ id }`, details);
                


                // Se hace un condicional si utiliza el metodo de tarjeta                
                if(details[4] == 4 ) {
                    
                    const inlineKeyboard = bot.inlineKeyboard([[bot.inlineButton(__('payCardBtn'), {pay: true})]]);

                    let total_amount;
                    
                    // Se toma el monto final del carrito
                    total_amount = await total(id);

                    // Se transforma a numero y se multiplica por 100 (debido a la funcion de payment de Telegram que lo divide entre 100)
                    total_amount = Number(total_amount) * 100;

                    // Se crea el mensaje para el payment (se usa el ejemplo del teleb)
                    bot.sendInvoice(msg.from.id, {
                        title: __('title_payment'),
                        description: __('descrip'),
                        payload: 'telebot-test-invoice',
                        providerToken: '284685063:TEST:MzFiODlkYTJjNDVl',
                        startParameter: 'pay',
                        currency: 'USD',
                        prices: [ { label: __('prices_payment'), amount: total_amount } ],
                        replyMarkup: inlineKeyboard
                    })

                    bot.on('preShippingQuery', (msg) => {
                        const id = msg.id;
                        const isOk = true;
                        return bot.answerPreCheckoutQuery(id, isOk);
                    });
                
                    bot.on('successfulPayment', (msg) => {
                        let replyMarkup = bot.inlineKeyboard([
                            [btn(__('emailBtn'), { callback : '/email'})]
                        ]);
                        return bot.sendMessage(msg.from.id, __('successfulPayment', msg.from.first_name), { replyMarkup });
                
                    });

                }

                else {

                    let replyMarkup = bot.inlineKeyboard([
                        [btn(__('emailBtn'), { callback : '/email'})]
                    ]);
                    return bot.sendMessage(msg.from.id, __('successfulPayment', msg.from.first_name), { replyMarkup });
                }

            } 
            
            catch (err) {
                log(err)
            }
        }

    }userDetails();

   
    
});

bot.on('/email', msg => {

    getLanguage(msg);

    let id = msg.from.id;

    async function email() {

        await sendMail(id);

        await API_DB.delete(ENDPOINTS_CARTS.DELETE_CART+`?userId=${ id }`);

    } email();

    return bot.sendMessage(id, __('email'));
})

bot.on('/deleteProducts', function (msg) {

    getLanguage(msg);

    let id = msg.from.id;

    return bot.sendMessage(id, __('deleteProducts'), { parseMode: 'html', ask: 'delProduct' });
});

bot.on('ask.delProduct', function (msg) {

    getLanguage(msg);

    let replyMarkup = bot.inlineKeyboard([
        [ btn(__('deleteMoreBtn'), { callback: '/deleteProducts'}) ],
        [ btn(__('viewCartBtn'), { callback : '/viewCart'}), btn(__('menuBtn'), { callback: '/menu' })  ]
    ]);

    let id = msg.from.id;
    let text = msg.text; 

    //Hace básicamente lo mismo que la función de addProducts
    async function delProduct() {

        try {

            let validProducts = areValidNumbers(text);

            if(!validProducts) {
                return bot.sendMessage(id, __('delProductInvalid'), {ask: 'delProduct'});
            }  else {
                
                //Agrega los productos al carrito
                let areInCart = await deleteProducts(id, validProducts);

                if(!areInCart) {
                    return bot.sendMessage(id, __('delProductNotInCart'), {ask: 'delProduct'})
                } else {

                    let products = `${validProducts}`

                    return bot.sendMessage(id, __('delProduct', products), { replyMarkup , parseMode: 'html', once: true});
                }

            } 

        } catch (err) {
            log(err)
        }

    }delProduct();
});

bot.connect();

function getLanguage(data) {
    if(data.from.language_code == 'es') {
        i18n.setLocale('es_ES');
        directory = 'data_es';
    } else {
        i18n.setLocale('en_US');
        directory = 'data_en';
    }
}
