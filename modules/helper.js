const axios    = require("axios");
module.exports = {
    generateRandomColor() {
        let colors = [
            'blue',
            'teal',
            'pink',
            'purple',
            'deep-purple',
            'indigo',
            'light-blue',
            'cyan',
            'light-green',
            'lime',
            'yellow',
            'amber',
            'orange',
            'deep-orange',
            'brown',
            'blue-grey',
            'grey'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    sendSMS(toPhone, text, callback) {
        text = encodeURIComponent(text);

        let url = 'http://sms.parsgreen.ir/UrlService/sendSMS.ashx?from=10000010000019' +
            '&to=' + toPhone +
            '&text=' + text +
            '&signature=148F5677-2BBF-4DB1-BD8B-7F9C06BA8B27';

        axios.get(url).then(response => {
            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    }
};