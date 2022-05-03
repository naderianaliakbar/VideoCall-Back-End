module.exports           = {
    generateRandomColor() {
        let colors = [
            'red',
            'green',
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
    }
};