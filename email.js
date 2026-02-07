const nodemailer = require('nodemailer');

async function sendVerificationEmail(to, token) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: false,
        auth: { user: 'antoxatur@gmail.com', pass: 'nxiv gfwh wzue gaek' }
    });

    const link = `http://localhost:3000/verify-email/${token}`;

    await transporter.sendMail({
        from: '"User Management" <no-reply@example.com>',
        to: 'antoxatur@gmail.com',
        subject: 'Подтверждение email',
        html: `<p>Нажмите на ссылку для подтверждения: <a href="${link}">${link}</a></p>`
    });
}

module.exports = sendVerificationEmail;
