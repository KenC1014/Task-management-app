const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const send_welcome_email = (email, name) => {
    sgMail.send({
        to: email,
        from: 'kenken4016@gmail.com',
        subject: 'Thank you for joining task management created by Ken Chen',
        text:  `Welcome to the task management app, ${name}. Let me know how you get along with the app.`
    })
}

const send_cancelation_email = (email, name) => {
    sgMail.send({
        to: email,
        from: 'kenken4016@gmail.com',
        subject: 'Sorry to see you go',
        text:  `Sorry to see you go, ${name}. Task management app development team.`
    })
}
module.exports = {
    send_welcome_email: send_welcome_email,
    send_cancelation_email:send_cancelation_email
}