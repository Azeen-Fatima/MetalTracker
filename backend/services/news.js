const axios = require('axios');
const cron = require('node-cron');

let cachedNews = [];

const fetchNews = async () => {
    try {
        const url = `https://newsapi.org/v2/everything?q=gold silver copper metal prices market&apiKey=${process.env.NEWS_API_KEY}&pageSize=10`;
        const response = await axios.get(url);
        if (response.data && response.data.articles) {
            cachedNews = response.data.articles.map(article => ({
                title: article.title,
                description: article.description,
                url: article.url,
                publishedAt: article.publishedAt,
                urlToImage: article.urlToImage
            }));
        }
    } catch (error) {
        console.error(error.message);
    }
};

cron.schedule('*/30 * * * *', fetchNews);
fetchNews();

module.exports = {
    getNews: () => cachedNews
};
