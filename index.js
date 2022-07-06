require('dotenv').config();

//Dependencias
const TeleBot = require('telebot');

//Instancia de axios
const { API_DB, ENDPOINTS_CARTS } = require('./config/instance');

//Utilidades
const { btn, log } = require('./utils/utils');

//Funciones creadas
const addProducts = require('./functions_bot/addProducts');
const areValidNumbers = require('./functions_bot/areValidNumbers');
const createCart = require('./functions_bot/createCart');
const getInfoProductId = require('./functions_bot/getInfoProductId');
const getInfoProducts = require('./functions_bot/getInfoProducts');
const sendMail = require('./functions_bot/sendMail');
const viewCart = require('./functions_bot/viewCart');
const validateDetails = require('./functions_bot/validateDetails');
const deleteProducts = require('./functions_bot/deleteProducts');

let TOKEN = process.env.TOKEN_TELEGRAM;

//Creación del TeleBot
const bot = new TeleBot({
    token: TOKEN,
    usePlugins: ['commandButton', 'askUser']
});


//MOSTRAR MENU PRINCIPAL - FUNCION DE INICIO

bot.on(['/start', '/menu'], function (msg) {

    //Define los botones a mostrar al final del menú
    let replyMarkup = bot.inlineKeyboard([
        [btn('Mostrar productos', { callback: '/showProducts' }), btn('Ver carrito', { callback: '/viewCart'}) ],
        [btn('Métodos de pago', { callback: '/listPayment' }), btn('Delivery y horario', { callback: '/delivery' })]
    ]);

    let id = msg.from.id;

    //Muestra el mensaje al usuario junto a los botones definidos
    return bot.sendMessage(id, `<b>Bienvenid@ al Bot de nuestra tienda!🛍️</b>\n\nSelecciona alguna de las siguientes opciones:`, { parseMode: 'html', replyMarkup });
});


//MOSTRAR PRODUCTOS OBTENIDOS DE LA API

bot.on('/showProducts', function (msg) {

    //Define los botones a mostrar al final de la lista
    let replyMarkup = bot.inlineKeyboard([
        [btn('Buscar producto', { callback: '/searchProduct' })],
        [btn('Agregar productos al carrito', { callback: '/cart' })],
        [btn('Volver al menu', { callback: '/menu' })]
    ]);

    async function products() {

        try {
            
            let result = await getInfoProducts();

            //Muestra el mensaje al usuario junto a los botones definidos
            return bot.sendMessage(msg.from.id, `<b>LISTA DE PRODUCTOS:📃</b>\n\n${result}`, { parseMode: 'html', replyMarkup });

        } catch (error) {
            log(error);
        }

    } products()
});


//BUSCAR INFORMACIÓN DE UN PRODUCTO

//El usuario ingresará un id que será pasado al ask.writtenId de abajo
bot.on('/searchProduct', function (msg) {

    let id = msg.from.id;

    return bot.sendMessage(id, 'Escriba el id de un producto que se encuentre en la lista:\n\n<i>Ej: 4</i>', { parseMode: 'html', ask: 'writtenId' });
});

//Toma lo que responda el usuario después del /searchProduct
bot.on('ask.writtenId', function (msg) {

    let replyMarkup = bot.inlineKeyboard([
        [
            btn('Buscar otro producto', { callback: '/searchProduct' }),
            btn('Volver al menu', { callback: '/menu' })
        ]
    ]);

    let id = msg.from.id;

    let writtenId = areValidNumbers(msg.text);

    if(!writtenId) {
        return bot.sendMessage(id, 'El valor ingresado no es válido. Inténtelo de nuevo.❌', { ask: 'writtenId' });
    }

    async function searchProduct() {

        try {
            
            let message = await getInfoProductId(writtenId);

            return bot.sendMessage(id, `${message}`, { parseMode: 'html', replyMarkup });

        } catch (error) {
            log(error);
        }

    } searchProduct();

});


//CREACIÓN DEL CARRITO Y AGREGADO DE PRODUCTOS

bot.on('/cart', function (msg) {
    
    let id = msg.from.id;

    //Se crea el carrito con el id del usuario
    createCart(id); 

    return bot.sendMessage(id, '¿Qué productos deseas agregar al carrito? 🛒 \n\n<i>Coloca el id o los id de los productos que deseas agregar a tu carrito\nEj: 1, 2, 2, 5, 9</i>', {ask: 'cartProducts', parseMode: 'html'});
});

bot.on('ask.cartProducts', function (msg) {

    let replyMarkup = bot.inlineKeyboard([
        [ btn('Agregar más productos', { callback: '/addMore'}),btn('Eliminar productos', { callback: '/deleteFromCart'}) ],
        [ btn('Ver carrito', { callback : '/viewCart'}), btn('Volver al menu', { callback: '/menu' })  ]
    ]);

    let id = msg.from.id;
    let text = msg.text; 

    async function addProductsCart(){
        try {

            let validProducts = areValidNumbers(text);

            if(!validProducts) {
                return bot.sendMessage('Ingresaste un valor inválido. Inténtalo de nuevo.❌', {ask: 'cartProducts'});
            }  else {

                //Agrega los productos al carrito
                await addProducts(id, validProducts);

                return bot.sendMessage(id, 'Los productos fueron agregados al carrito con éxito ✅.\n\n<i>¿En qué otra cosa te puedo ayudar?</i>', { replyMarkup , parseMode: 'html'});

            }  

        } catch (err) {
            log(err)
        }

    }addProductsCart();

});


//AGREGAR MÁS PRODUCTOS AL CARRITO UNA VEZ ESTÁ CREADO

bot.on('/addMore', function (msg) {
    
    let id = msg.from.id;
    return bot.sendMessage(id, '¿Qué otros productos deseas ingresar al carrito? 🛒\n\n<i>Coloca el id o los id de los productos que deseas agregar a tu carrito\nEj: 1, 2, 2, 5, 9</i>', {ask: 'moreProducts', parseMode: 'html'});
});

bot.on('ask.moreProducts', function (msg) {

    let replyMarkup = bot.inlineKeyboard([
        [ btn('Agregar más productos', { callback: '/addMore'}), btn('Eliminar productos', { callback: '/deleteFromCart'})],
        [ btn('Ver carrito', { callback : '/viewCart'}), btn('Volver al menu', { callback: '/menu' })  ]
    ]);

    let id = msg.from.id;
    let text = msg.text; 

    //Hace básicamente lo mismo que la función de addProducts
    async function addMore() {

        try {

            let validProducts = areValidNumbers(text);

            if(!validProducts) {
                return bot.sendMessage('Ingresaste un valor inválido. Inténtalo de nuevo.❌', {ask: 'cartProducts'});
            }  else {

                //Agrega los productos al carrito
                await addProducts(id, validProducts);

                return bot.sendMessage(id, 'Los productos fueron agregados al carrito con éxito. ✅\n\n<i>¿En qué otra cosa te puedo ayudar?</i>', { replyMarkup , parseMode: 'html'});

            } 

        } catch (err) {
            log(err)
        }

    }addMore();
});

bot.on('/deleteFromCart', function (msg) {
    
    let id = msg.from.id;
    return bot.sendMessage(id, '¿Qué productos deseas eliminar de tu carrito? 🛒\n\n<i>Coloca el id o los id de los productos que deseas eliminar de tu carrito\nEj: 1, 2, 2, 5, 9</i>', {ask: 'deleteCartProducts', parseMode: 'html'});
});
bot.on('ask.deleteCartProducts', function (msg) {

    let replyMarkup = bot.inlineKeyboard([
        [ btn('Agregar más productos', { callback: '/addMore'}),btn('Eliminar productos', { callback: '/deleteFromCart'}) ],
        [ btn('Ver carrito', { callback : '/viewCart'}), btn('Volver al menu', { callback: '/menu' })  ]
    ]);

    let id = msg.from.id;
    let text = msg.text; 

    async function deleteProductsCart(){
        try {

            let validProducts = areValidNumbers(text);

            if(!validProducts) {
                return bot.sendMessage('Ingresaste un valor inválido. Inténtalo de nuevo.❌', {ask: 'deleteCartProducts'});
            }  else {

                //Agrega los productos al carrito
                await deleteProducts(id, validProducts);

                return bot.sendMessage(id, 'Los productos fueron eliminados del carrito con éxito ✅.\n\n<i>¿En qué otra cosa te puedo ayudar?</i>', { replyMarkup , parseMode: 'html'});

            }  

        } catch (err) {
            log(err)
        }

    }deleteProductsCart();

});



//VER CARRITO

bot.on('/viewCart', function (msg) {

    let replyMarkup = bot.inlineKeyboard([
        [ btn('Agregar más productos', { callback: '/addMore'}), btn('Eliminar productos', { callback: '/deleteFromCart'}) ],
        [ btn('Facturar', { callback: '/facturar'}), btn('Volver al menu', { callback: '/menu' }) ]
    ]);

    let id = msg.from.id;

    bot.sendMessage(id, '<i>Tomando la información del carrito...</i> ⏱', { parseMode: 'html' });

    async function verCarrito() {

        try {

            let res = await viewCart(id);

            if(res == undefined) {

                replyMarkup = bot.inlineKeyboard([
                    [ btn('Mostrar productos', { callback: '/showProducts' }), btn('Volver al menu', { callback: '/menu' }) ]
                ]);

                return bot.sendMessage(id, "Disculpe, no ha ingresado productos a su carrito. ❌\n\nPara hacerlo, seleccione la opción 'Mostrar productos' y agregue productos a su carrito.", { replyMarkup });
            }

            return bot.sendMessage(id, `<b>SU CARRITO DE COMPRAS</b> 🛒\n\n${ res }`, { replyMarkup, parseMode: 'html' });

        } catch (err) {
            log(err);
        }

    }verCarrito();
   
})


//FACTURACIÓN

bot.on('/facturar', function (msg) {

    let id = msg.from.id;

    let message = 'Ingrese su nombre, apellido, correo electrónico, ubicación y método de pago después de leer el mensaje.\n\n' +
                  'Para la ubicación y el método de pago, solo debe ingresar el número correspondiente de la lista\n\n' +
                  '<b>ZONAS DE DELIVERY</b> 🚲\n1) Foozik\n2) Barqux\n3) Octohall\n4) Quzik\n\n' +
                  '<b>MÉTODOS DE PAGO</b> 💸\n1) Efectivo\n2) Transferencia\n3) BTC\n4) ETH\n5) USDT\n\n' +
                  '<i>Ej: Foo, Zik, foozik@foo.com, 3, 2\nEs importante que separe con coma los datos.</i>'

    return bot.sendMessage(id, `${ message }`, { parseMode: 'html', ask: 'userDetails' });

});

bot.on('ask.userDetails', function (msg) {

    let id = msg.from.id;
    let text = msg.text;

    async function userDetails() {

        let details = await validateDetails(text);

        if(!details) {
            return bot.sendMessage(id, "❌ Ingresaste valores invalidos. Intentalo de nuevo, recuerda el ejemplo.\n\n <i>Ej: Foo, Zik, foozik6@foo.com, 1, 4\n\nPresta atencion a las comas.❕</i>", { parseMode: 'html', once: true, ask: 'userDetails' });
        } 
        
        else {

            try {

                // Se actualizan los datos del usuario
                await API_DB.put(ENDPOINTS_CARTS.PUT_USER_DETAILS+`?userId=${ id }`, details);
                bot.sendMessage(id, `<i>Obteniendo informacion...</i>`, { parseMode: 'html' });


                // Se hace un condicional si utiliza el metodo de tarjeta                
                if(details[4] == 4 ) {
                    
                    const inlineKeyboard = bot.inlineKeyboard([[bot.inlineButton('Paga con tarjeta!', {pay: true})]]);

                    let total_amount;
                    
                    // Se toma el monto final del carrito
                    total_amount = await getTotalAmount(id);

                    // Se transforma a numero y se multiplica por 100 (debido a la funcion de payment de Telegram que lo divide entre 100)
                    total_amount = Number(total_amount) * 100;

                    // Se crea el mensaje para el payment (se usa el ejemplo del teleb)
                    bot.sendInvoice(msg.from.id, {
                        title: 'Pago 💳',
                        description: 'Tarjeta Mastercard/VISA',
                        payload: 'telebot-test-invoice',
                        providerToken: '5322214758:TEST:df58316a-2504-4ed9-b037-0010e5a851b9',
                        startParameter: 'pay',
                        currency: 'USD',
                        prices: [ { label: 'Monto total', amount: total_amount } ],
                        replyMarkup: inlineKeyboard
                    })

                    bot.on('preShippingQuery', (msg) => {
                        const id = msg.id;
                        const isOk = true;
                        return bot.answerPreCheckoutQuery(id, isOk);
                    });
                
                    bot.on('successfulPayment', (msg) => {
                        let replyMarkup = bot.inlineKeyboard([
                            [btn('Finalizar y enviar el email con la factura ✉️', { callback : '/email'})]
                        ]);
                        return bot.sendMessage(msg.from.id, `Gracias por su compra, ${msg.from.first_name}!`, { replyMarkup });
                
                    });

                }

                else {

                    let replyMarkup = bot.inlineKeyboard([
                        [btn('Finalizar y enviar el email con la factura ✉️', { callback : '/email'})]
                    ]);
                    return bot.sendMessage(msg.from.id, `Gracias por su compra, ${msg.from.first_name}!`, { replyMarkup });
                }

            } 
            
            catch (err) {
                log(err)
            }
        }

    }userDetails();

   
    
});

bot.on('/email', msg => {

    let id = msg.from.id;

    async function email() {

        await sendMail(id);

        await API_DB.delete(ENDPOINTS_CARTS.DELETE_CART+`?userId=${ id }`);

    } email();

    return bot.sendMessage(id, 'Te enviamos un correo con la factura.\n\nGracias por elegirnos! 🤖💌\n\nSi quieres hacer otra compra 🛍 envia /start',);
})


//VER MÉTODOS DE PAGO

bot.on('/listPayment', function (msg) {

    let id = msg.from.id;
    let message = '<b>Nuestros métodos de pago aceptados son: 💸</b>\n\n' +
        '- Efectivo\n- Transferencia\n- Crypto:\n     - BTC\n     - ETH\n     - USDT';

    return bot.sendMessage(id, `${message}`, { parseMode: 'html' });
});


//VER ZONAS DE DELIVERY

bot.on('/delivery', function (msg) {

    let replyMarkup = bot.inlineKeyboard([
        [btn('Volver al menu', { callback: '/menu' })]
    ]);

    let id = msg.from.id;

    let message = '<b>NUESTRAS ZONAS DE DELIVERY 🚲</b>\n\n- Foozik\n- Barqux\n- Octohall\n- Quzik\n\n' +
                  '<b>HORARIOS DE ATENCIÓN</b>\n\nTodos los días 8:00 AM a 9:00 PM\n\n' +
                  '<i>Estamos para servirte!</i>'

    return bot.sendMessage(id, `${ message }`, { parseMode: 'html', replyMarkup });
});

bot.on('callbackQuery', (msg) => {
    log('callbackQuery data:', msg.data);
    bot.answerCallbackQuery(msg.id);
});

bot.connect();