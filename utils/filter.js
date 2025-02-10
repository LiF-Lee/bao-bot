const levenshtein = (a, b) => {
    var prevRow = Array(b.length + 1).fill(0);
    var currRow = Array(b.length + 1).fill(0);

    for (let j = 0; j <= b.length; j++) prevRow[j] = j;

    for (let i = 1; i <= a.length; i++) {
        currRow[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            currRow[j] = Math.min(
                prevRow[j] + 1,
                currRow[j - 1] + 1,
                prevRow[j - 1] + indicator
            );
        }
        [prevRow, currRow] = [currRow, prevRow];
    }
    return prevRow[b.length];
};

const sanitizeText = (text) => {
    return text.replace(/[^a-zA-Z가-힣0-9]/g, "").toLowerCase();
};

const getMaxSimilarity = (text, filterWord) => {
    const sanitizedText = sanitizeText(text);
    const sanitizedFilterWord = sanitizeText(filterWord);

    const textLength = sanitizedText.length;
    const filterLength = sanitizedFilterWord.length;

    if (textLength === 0 || filterLength === 0) return 0;

    let maxSimilarity = 0;
    const cache = {};

    for (let i = 0; i < textLength; i++) {
        for (let j = i + 1; j <= textLength; j++) {
            const subText = sanitizedText.slice(i, j);

            if (cache[subText]) {
                maxSimilarity = Math.max(maxSimilarity, cache[subText]);
                continue;
            }

            const levDistance = levenshtein(subText, sanitizedFilterWord);
            const similarity = 1 - levDistance / Math.max(subText.length, filterLength);
            cache[subText] = similarity;

            maxSimilarity = Math.max(maxSimilarity, similarity);

            // 최대 유사도가 이미 1.0이면 조기 탈출
            if (maxSimilarity === 1.0) return maxSimilarity;
        }
    }

    return maxSimilarity;
};

const isFiltered = (text, filterWords, similarityThreshold = 0.65) => {
    const uniqueFilterWords = new Set(filterWords.map(sanitizeText));
    for (const filterWord of uniqueFilterWords) {
        const maxSimilarity = getMaxSimilarity(text, filterWord);
        if (maxSimilarity >= similarityThreshold) {
            console.log(`FilterWord: ${filterWord}, Text: ${text}, MaxSimilarity: ${maxSimilarity}`);
            return true;
        }
    }
    return false;
};

module.exports = {
    isFiltered
};
