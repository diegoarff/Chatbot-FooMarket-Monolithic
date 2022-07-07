const nodemailer = require('nodemailer');
var i18n = require("i18n");

const { API_DB, ENDPOINTS_CARTS } = require('~inst');

const viewCart = require('./viewCart');

async function sendMail(userId) {

    try {
        
        let res = await API_DB.get(ENDPOINTS_CARTS.GET_CART + `?userId=${userId}`);
        let cart = res.data;
    
        let { firstName, lastName, email, location, payment_method } = cart[0].user_details;
    
        let locations = ['Caracas', 'Zulia', 'Carabobo', 'Merida'];
        let pay_methods = ['Dollars', 'Bank Transfers', 'Cryptos', 'Credit / Debit card', 'Foreign cash'];
    
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, 
            auth: {
                user: 'equipo7socialoplesk@gmail.com', 
                pass: 'otggpxhtyarvecmg', 
            },
        });
    
        let msg = await viewCart(userId);
    
        function date() {
            return new Date().toLocaleDateString();
        }
    
        let message = __('sendMailText', date(), firstName, lastName, locations[location - 1], pay_methods[payment_method - 1], msg);
        let subject = __('emailSubject');

        let info = await transporter.sendMail({
            from: '"Foo Market 6" <equipo7socialoplesk@gmail.com>', 
            to: `${email}, equipo7socialoplesk@gmail.com`, 
            subject: `${subject}`, 
            text: `${message}`
            },
            function (error) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(null, {
                        statusCode: 200,
                        body: "Ok"
                    });
                } 
            }
        );

    } catch (err) {
        console.log(err);
    }

}


module.exports = sendMail;