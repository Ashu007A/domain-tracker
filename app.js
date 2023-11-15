const whois = require('node-whois');
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const fs = require('fs');

function extractWhoisInfo(domain, callback) {
    whois.lookup(domain, (err, data) => {
        if (err) {
            fs.appendFile('whois_error.log', `${new Date()} - ${err}\n`, (error) => {
                if (error) console.error('Error writing to error log:', error);
            });

            callback(err, null);
            return;
        }
        console.log('Raw WHOIS data:', data);
        callback(null, data);
    });
}

function saveToCSV(data) {
    const csvData = `${data.name},${data.domain},${data.email},${data.phone},${data.date}\n`;
    fs.appendFile('whois_data.csv', csvData, (err) => {
        if (err) console.error('Error writing to CSV:', err);
    });
}

function sendEmail(data) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'aram.work.software@gmail.com',
            pass: 'xerjjgpusswmddac'
        }
    });

    const mailOptions = {
        from: 'aram.work.software@gmail.com',
        to: 'ashishrambsp0077@gmail.com',
        subject: 'WHOIS Data for Newly Registered Domains',
        text: `Name: ${data.name}\nDomain: ${data.domain}\nEmail: ${data.email}\nPhone: ${data.phone}\nDate: ${data.date}`
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.error('Error sending email:', error);
            fs.appendFile('whois_error.log', `${new Date()} - ${error}\n`, (err) => {
                if (err) console.error('Error writing to error log:', err);
            });
        }
    });
}

schedule.scheduleJob('0 0 * * *', () => {
    const domain = 'www.example.com';
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

    extractWhoisInfo(domain, (err, whoisData) => {
        if (err) {
            console.error('Error extracting WHOIS information:', err);

            fs.appendFile('whois_error.log', `${new Date()} - ${err}\n`, (error) => {
                if (error) console.error('Error writing to error log:', error);
            });

            return;
        }

        const data = {
            name: whoisData.name || '',
            domain: domain,
            email: whoisData.email || '',
            phone: whoisData.phone || '',
            date: formattedDate
        };

        saveToCSV(data);
        sendEmail(data);
    });
});