const convertUnit = (pricePerOz, unit) => {
    if (unit === 'gram') {
        return pricePerOz / 31.1035;
    }
    if (unit === 'tola') {
        return (pricePerOz / 31.1035) * 11.6638;
    }
    return pricePerOz;
};

const convertCurrency = (price, currency, exchangeRate) => {
    if (currency === 'PKR') {
        return price * exchangeRate;
    }
    return price;
};

module.exports = { convertUnit, convertCurrency };
