class Utils {

    static dateFormat(date) {

        return this.addZero(date.getDate()) + '/' + this.addZero((date.getMonth() + 1)) + '/' + date.getFullYear() + ' ' + this.addZero(date.getHours()) + ':' + this.addZero(date.getMinutes());
        
        }
        
    static addZero(date) {
        
        return (date.toString().length == 1) ? '0' + date.toString() : date;
        
    }

}