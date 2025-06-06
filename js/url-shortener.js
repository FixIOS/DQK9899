
// API rút gọn URL
const URL_SHORTENER_API = 'https://yeumoney.com/QL_api.php';
const API_TOKEN = '8df5e500659c1d9c18d6d758579b76c06e4193529c354eb5fab16ad1c518d093';

/**
 * Rút gọn URL bằng API yeumoney.com
 * @param {string} originalUrl - URL gốc cần rút gọn
 * @returns {Promise<string>} - URL đã được rút gọn
 */
async function shortenUrl(originalUrl) {
    try {
        // Kiểm tra nếu URL đã được rút gọn bởi yeumoney.com rồi
        if (originalUrl.includes('yeumoney.com')) {
            console.log('URL đã được rút gọn bởi yeumoney.com:', originalUrl);
            return originalUrl;
        }
        
        // Chỉ rút gọn các URL thực sự (không phải file .html, LienQuan.html hoặc lienquan.js)
        if (originalUrl.endsWith('.html') || 
            originalUrl.startsWith('download.html') || 
            originalUrl.includes('LienQuan.html') ||
            originalUrl.includes('lienquan.js')) {
            console.warn('Không thể rút gọn URL:', originalUrl);
            return originalUrl;
        }
        
        const apiUrl = `${URL_SHORTENER_API}?token=${API_TOKEN}&format=json&url=${encodeURIComponent(originalUrl)}`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Kiểm tra cấu trúc phản hồi từ API
        if (data && data.short_url) {
            return data.short_url;
        } else if (data && data.shortenedUrl) {
            return data.shortenedUrl;
        } else {
            console.warn('Không thể rút gọn URL:', originalUrl, 'Response:', data);
            return originalUrl; // Trả về URL gốc nếu không rút gọn được
        }
    } catch (error) {
        console.error('Lỗi khi rút gọn URL:', error);
        return originalUrl; // Trả về URL gốc nếu có lỗi
    }
}

/**
 * Rút gọn tất cả URLs trong một mảng game data
 * @param {Array} gameData - Mảng dữ liệu game
 * @param {boolean} skipShortening - Bỏ qua việc rút gọn URL
 * @returns {Promise<Array>} - Mảng dữ liệu game với URLs đã được rút gọn
 */
async function shortenGameUrls(gameData, skipShortening = false) {
    if (skipShortening) {
        // Không rút gọn URL, chỉ sử dụng download_url gốc
        gameData.forEach(game => {
            if (game.download_url) {
                game.shortened_url = game.download_url;
            }
        });
        return gameData;
    }
    
    const promises = gameData.map(async (game) => {
        if (game.download_url) {
            game.shortened_url = await shortenUrl(game.download_url);
        }
        return game;
    });
    
    return Promise.all(promises);
}

/**
 * Cache để lưu trữ URLs đã rút gọn
 */
const urlCache = new Map();

/**
 * Rút gọn URL với cache
 * @param {string} originalUrl - URL gốc
 * @returns {Promise<string>} - URL đã rút gọn
 */
async function shortenUrlWithCache(originalUrl) {
    if (urlCache.has(originalUrl)) {
        return urlCache.get(originalUrl);
    }
    
    const shortenedUrl = await shortenUrl(originalUrl);
    urlCache.set(originalUrl, shortenedUrl);
    return shortenedUrl;
}
