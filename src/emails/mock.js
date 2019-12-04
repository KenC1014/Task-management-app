const sgMail = require('@sendgrid/mail')

const sendgrid_API_Key = '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'
sgMail.setApiKey(sendgrid_API_Key)

sgMail.send({
    to: 'kenken4016@gmail.com',
    from: 'yuzhen920@126.com',
    subject: 'From domestic',
    text: 'this is content'
})

// for (i = 0; i < 5; i++) {
//     sgMail.send({
//         to: 'kenken4016@gmail.com',
//         from: 'kenken4016@gmail.com',
//         subject: 'Title',
//         text: 'this is content'
//     })
//   }